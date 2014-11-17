<?php
/**
 * Shopware 5
 * Copyright (c) shopware AG
 *
 * According to our dual licensing model, this program can be used either
 * under the terms of the GNU Affero General Public License, version 3,
 * or under a proprietary license.
 *
 * The texts of the GNU Affero General Public License with an additional
 * permission and of our proprietary license can be found at and
 * in the LICENSE file you have received along with this program.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * "Shopware" is a registered trademark of shopware AG.
 * The licensing of the program under the AGPLv3 does not imply a
 * trademark license. Therefore any rights, title and interest in
 * our trademarks remain entirely with us.
 */
namespace Shopware\Bundle\StoreFrontBundle\Service\Core;

use Shopware\Bundle\StoreFrontBundle\Struct;
use Shopware\Bundle\StoreFrontBundle\Service;
use Shopware\Bundle\StoreFrontBundle\Gateway;

/**
 * @category  Shopware
 * @package   Shopware\Bundle\StoreFrontBundle\Service\Core
 * @copyright Copyright (c) shopware AG (http://www.shopware.de)
 */
class ListProductService implements Service\ListProductServiceInterface
{
    /**
     * @var Gateway\ListProductGatewayInterface
     */
    private $productGateway;

    /**
     * @var Service\MediaServiceInterface
     */
    private $mediaService;

    /**
     * @var Service\CheapestPriceServiceInterface
     */
    private $cheapestPriceService;

    /**
     * @var Service\GraduatedPricesServiceInterface
     */
    private $graduatedPricesService;

    /**
     * @var Service\PriceCalculationServiceInterface
     */
    private $priceCalculationService;

    /**
     * @var Service\MarketingServiceInterface
     */
    private $marketingService;

    /**
     * @var Service\VoteServiceInterface
     */
    private $voteService;

    /**
     * @var \Enlight_Event_EventManager
     */
    private $eventManager;

    /**
     * @param Gateway\ListProductGatewayInterface $productGateway
     * @param Service\GraduatedPricesServiceInterface $graduatedPricesService
     * @param Service\CheapestPriceServiceInterface $cheapestPriceService
     * @param Service\PriceCalculationServiceInterface $priceCalculationService
     * @param Service\MediaServiceInterface $mediaService
     * @param Service\MarketingServiceInterface $marketingService
     * @param Service\VoteServiceInterface $voteService
     * @param \Enlight_Event_EventManager $eventManager
     */
    public function __construct(
        Gateway\ListProductGatewayInterface $productGateway,
        Service\GraduatedPricesServiceInterface $graduatedPricesService,
        Service\CheapestPriceServiceInterface $cheapestPriceService,
        Service\PriceCalculationServiceInterface $priceCalculationService,
        Service\MediaServiceInterface $mediaService,
        Service\MarketingServiceInterface $marketingService,
        Service\VoteServiceInterface $voteService,
        \Enlight_Event_EventManager $eventManager
    ) {
        $this->productGateway = $productGateway;
        $this->graduatedPricesService = $graduatedPricesService;
        $this->cheapestPriceService = $cheapestPriceService;
        $this->priceCalculationService = $priceCalculationService;
        $this->mediaService = $mediaService;
        $this->eventManager = $eventManager;
        $this->marketingService = $marketingService;
        $this->voteService = $voteService;
    }

    /**
     * @inheritdoc
     */
    public function get($number, Struct\ProductContextInterface $context)
    {
        $products = $this->getList(array($number), $context);

        return array_shift($products);
    }

    /**
     * @inheritdoc
     */
    public function getList(array $numbers, Struct\ProductContextInterface $context)
    {
        $products = $this->productGateway->getList($numbers, $context);

        $covers = $this->mediaService->getCovers($products, $context);

        $graduatedPrices = $this->graduatedPricesService->getList($products, $context);

        $cheapestPrices = $this->cheapestPriceService->getList($products, $context);

        $voteAverages = $this->voteService->getAverages($products, $context);

        $result = array();
        foreach ($numbers as $number) {
            if (!array_key_exists($number, $products)) {
                continue;
            }
            $product = $products[$number];

            if (isset($covers[$number])) {
                $product->setCover($covers[$number]);
            }

            if (isset($graduatedPrices[$number])) {
                $product->setPriceRules($graduatedPrices[$number]);
            }

            if (isset($cheapestPrices[$number])) {
                $product->setCheapestPriceRule($cheapestPrices[$number]);
            }

            if (isset($voteAverages[$number])) {
                $product->setVoteAverage($voteAverages[$number]);
            }

            $product->addAttribute(
                'marketing',
                $this->marketingService->getProductAttribute($product)
            );

            $this->priceCalculationService->calculateProduct($product, $context);

            if ($this->isProductValid($product, $context)) {
                $result[$number] = $product;
            }
        }

        return $result;
    }


    /**
     * Checks if the provided product is allowed to display in the store front for
     * the provided context.
     *
     * @param Struct\ListProduct $product
     * @param Struct\ProductContextInterface $context
     * @return bool
     */
    private function isProductValid(Struct\ListProduct $product, Struct\ProductContextInterface $context)
    {
        if (in_array($context->getCurrentCustomerGroup()->getId(), $product->getBlockedCustomerGroupIds())) {
            return false;
        }

        $prices = $product->getPrices();
        if (empty($prices)) {
            return false;
        }

        return true;
    }
}
