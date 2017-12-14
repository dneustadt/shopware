<?php declare(strict_types=1);

namespace Shopware\Order\Event\OrderDeliveryPosition;

use Shopware\Context\Struct\TranslationContext;
use Shopware\Framework\Event\NestedEvent;
use Shopware\Framework\Event\NestedEventCollection;
use Shopware\Order\Collection\OrderDeliveryPositionBasicCollection;
use Shopware\Order\Event\OrderLineItem\OrderLineItemBasicLoadedEvent;

class OrderDeliveryPositionBasicLoadedEvent extends NestedEvent
{
    const NAME = 'order_delivery_position.basic.loaded';

    /**
     * @var TranslationContext
     */
    protected $context;

    /**
     * @var OrderDeliveryPositionBasicCollection
     */
    protected $orderDeliveryPositions;

    public function __construct(OrderDeliveryPositionBasicCollection $orderDeliveryPositions, TranslationContext $context)
    {
        $this->context = $context;
        $this->orderDeliveryPositions = $orderDeliveryPositions;
    }

    public function getName(): string
    {
        return self::NAME;
    }

    public function getContext(): TranslationContext
    {
        return $this->context;
    }

    public function getOrderDeliveryPositions(): OrderDeliveryPositionBasicCollection
    {
        return $this->orderDeliveryPositions;
    }

    public function getEvents(): ?NestedEventCollection
    {
        $events = [];
        if ($this->orderDeliveryPositions->getOrderLineItems()->count() > 0) {
            $events[] = new OrderLineItemBasicLoadedEvent($this->orderDeliveryPositions->getOrderLineItems(), $this->context);
        }

        return new NestedEventCollection($events);
    }
}