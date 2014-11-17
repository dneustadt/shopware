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
 *
 * @category   Shopware
 * @package    UserManager
 * @subpackage View
 * @version    $Id$
 * @author shopware AG
 */

//{namespace name=backend/emotion/view/detail}

/**
 * Shopware UI - Media Manager Main Window
 *
 * This file contains the business logic for the User Manager module. The module
 * handles the whole administration of the backend users.
 */
//{block name="backend/emotion/view/detail/settings"}
Ext.define('Shopware.apps.Emotion.view.detail.Settings', {
	extend: 'Ext.form.Panel',
    title: '{s name=title/settings_tab}Settings{/s}',
    alias: 'widget.emotion-detail-settings',
    bodyPadding: 20,
    border: 0,
    bodyBorder: 0,
    autoScroll: true,
    style: 'background: #f9fafa',

    // Default settings for all underlying items
    defaults: {
        labelWidth: 155,
        anchor: '100%'
    },

    snippets: {
        fields: {
            responsive_adjustments: '{s name=grids/settings/responsive_adjustments}Responsive Design adjustments{/s}',
            masonry_effect: '{s name=grids/settings/masonry_effect}Masonry effect{/s}',
            resize_effect: '{s name=grids/settings/resize_effect}Resize of the elements{/s}'
        },
        support: {
            masonry_effect: '{s name=grid/settings/support/masonry_effect}The mansonry effects rearranges the elements to use available space as efficient as possible based on the viewport size.{/s}',
            resize_effect: '{s name=grid/settings/support/resize_effect}The elements are scaled based on the available viewport size. This mode is recommend when device-specific shopping worlds are defined.{/s}'
        }
    },

    /**
     * Initializes the component and builds up the main interface
     *
     * @return void
     */
    initComponent: function() {
        var me = this;

        me.categoryPathStore = Ext.create('Shopware.apps.Emotion.store.CategoryPath');
        me.categoryPathStore.getProxy().extraParams.parents = true;
        me.categoryPathStore.load();

        me.timingFieldSet =  me.createTimingFieldSet();
        me.generalFieldSet = me.createGeneralFieldSet();
        me.categoryFieldSet = me.createCategoryFieldSet();
        me.landingPageFieldSet = me.createLandingpageFieldset();

        me.nameField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '{s name=settings/emotion_name_field}Emotion name{/s}',
            emptyText: '{s name=settings/emotion_name_empty}My new emotion{/s}',
            name: 'name',
            labelWidth: me.defaults.labelWidth
        });

        me.activeComboBox = Ext.create('Ext.form.field.Checkbox', {
            fieldLabel: '{s name=settings/active}Active{/s}',
            boxLabel: '{s name=settings/active_box_label}Emotion will be visible in the store front{/s}',
            name: 'active',
            inputValue: true,
            uncheckedValue:false,
            labelWidth: me.defaults.labelWidth
        });

        me.landingPageCheckbox = Ext.create('Ext.form.field.Checkbox', {
            fieldLabel: '{s name=settings/landingpage_checkbox}Landingpage{/s}',
            boxLabel: '{s name=settings/landingpage_box_label}This emotion is a landing page{/s}',
            name: 'isLandingPage',
            inputValue: true,
            uncheckedValue: false,
            labelWidth: me.defaults.labelWidth,
            listeners: {
                scope: me,
                change: function(field, value) {

                    if(value) {
                        me.containerWidthField.setValue(1008);
                        me.categoryNameField.hide().setDisabled(true);
                        me.categoryFieldSet.hide();
                        me.landingPageFieldSet.show();
                    } else {
                        me.containerWidthField.setValue(808);
                        me.categoryNameField.show().setDisabled(false);
                        me.landingPageFieldSet.hide();
                        me.categoryFieldSet.show();
                    }
                }
            }
        });

        me.items = [
            me.nameField,
            me.landingPageCheckbox,
            me.activeComboBox,
            me.generalFieldSet,
            me.categoryFieldSet,
            me.timingFieldSet,
            me.landingPageFieldSet
        ];

        me.callParent(arguments);

        me.loadRecord(me.emotion);
    },

    createCategoryFieldSet: function() {
        var me = this;

        me.categoryNameField = Ext.create('Shopware.form.field.PagingComboBox', {
            anchor: '100%',
            name: 'categoryId',
            emptyText: '{s name=settings/select_category_empty}Please select...{/s}',
            allowBlank: false,
            pageSize: 15,
            fieldLabel: '{s name=settings/select_category_field}Select a category{/s}',
            store: me.categoryPathStore,
            valueField: 'id',
            displayField: 'name',
            labelWidth: me.defaults.labelWidth - 20
        });

        me.listingCheckbox = Ext.create('Ext.form.field.Checkbox', {
            fieldLabel: '{s name=settings/listing}Listing{/s}',
            boxLabel: '{s name=settings/listing_box_label}Listing will be visible under the emotion{/s}',
            name: 'showListing',
            inputValue: true,
            uncheckedValue: false,
            labelWidth: me.defaults.labelWidth - 20
        });

        return Ext.create('Ext.form.FieldSet', {
            xtype: 'fieldset',
            title: '{s name=settings/fieldset/category_settings}{/s}',
            margin: '20 0 0',
            items: [
                me.categoryNameField,
                me.listingCheckbox
            ]
        });
    },

    createGeneralFieldSet: function() {
        var me = this;

        me.gridComboBox = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: '{s name=settings/select_grid_field}Select a grid{/s}',
            name: 'gridId',
            allowBlank: false,
            editable: false,
            queryMode: 'remote',
            store: Ext.create('Shopware.apps.Emotion.store.Grids').load(),
            displayField: 'name',
            valueField: 'id',
            emptyText: '{s name=settings/select_grid_empty}Please select...{/s}',
            labelWidth: me.defaults.labelWidth - 20,
            anchor: '100%'
        });

        var tplComboBox = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: '{s name=settings/fieldset/select_template}Select Template{/s}',
            name: 'templateId',
            valueField: 'id',
            displayField: 'name',
            queryMode: 'remote',
            store: Ext.create('Shopware.apps.Emotion.store.Templates').load(),
            emptyText: '{s name=settings/fieldset/select_template_empty}Please select...{/s}',
            labelWidth: me.defaults.labelWidth - 20,
            anchor: '100%'
        });

        me.containerWidthField = Ext.create('Ext.form.field.Number', {
            fieldLabel: '{s name=settings/fieldset/container_width}Container width{/s}',
            name: 'containerWidth',
            supportText: '{s name=settings/fieldset/container_width_info}Container width in pixel (px){/s}',
            anchor: '100%',
            width: '100%',
            labelWidth: me.defaults.labelWidth - 20
        });

        var responsiveModeStore = Ext.create('Ext.data.Store', {
            fields: [ 'display', 'value', 'supportText' ],
            data: [
                { 'display': me.snippets.fields.masonry_effect, 'value': 'masonry', 'supportText': me.snippets.support.masonry_effect },
                { 'display': me.snippets.fields.resize_effect, 'value': 'resize', 'supportText': me.snippets.support.resize_effect }
            ]
        });

        var responsiveMode = Ext.create('Ext.form.field.ComboBox', {
            name: 'mode',
            store: responsiveModeStore,
            queryMode: 'local',
            displayField: 'display',
            valueField: 'value',
            fieldLabel: me.snippets.fields.responsive_adjustments,
            allowBlank: false,
            labelWidth: me.defaults.labelWidth - 20,
            anchor: '100%',
            tpl: Ext.create('Ext.XTemplate',
                '{literal}<tpl for=".">',
                '<div class="x-boundlist-item">',
                '<h1>{display}</h1>{supportText}',
                '</div>',
                '</tpl>{/literal}'
            )
        });

        var deviceComboBox = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: '{s name=settings/fieldset/select_device}Select device{/s}',
            name: 'device',
            valueField: 'id',
            displayField: 'name',
            store: Ext.create('Ext.data.Store', {
                fields: [ 'name' ],
                data : me.createDeviceData()
            }),
            queryMode: 'local',
            emptyText: '{s name=settings/fieldset/select_template_empty}Please select...{/s}',
            labelWidth: me.defaults.labelWidth - 20,
            anchor: '100%'
        });

        var fullscreen = Ext.create('Ext.form.field.Checkbox', {
            inputValue: 1,
            uncheckedValue: 0,
            fieldLabel: '{s name=settings/label/fullscreen}{/s}',
            boxLabel: '{s name=settings/boxlabel/fullscreen}{/s}',
            name: 'fullscreen',
            labelWidth: me.defaults.labelWidth - 20,
            anchor: '100%'
        });

        return Ext.create('Ext.form.FieldSet', {
            title: '{s name=settings/fieldset/general_settings}{/s}',
            layout: 'column',
            margin: '20 0 0',
            items: [
                {
                    xtype: 'container',
                    columnWidth: 1,
                    layout: 'anchor',
                    items: [ me.containerWidthField, responsiveMode ]
                }, {
                    xtype: 'container',
                    columnWidth: .5,
                    margin: '0 10 0 0',
                    layout: 'anchor',
                    items: [ me.gridComboBox ]
                }, {
                    xtype: 'container',
                    columnWidth: .5,
                    layout: 'anchor',
                    margin: '0 0 0 10',
                    items: [ tplComboBox ]
                }, {
                    xtype: 'container',
                    columnWidth: 1,
                    layout: 'anchor',
                    items: [ deviceComboBox, fullscreen ]
                }
            ]
        });
    },

    createDeviceData: function() {
        return [{
            "id" : 0,
            "name" : "Desktop (1260px)"
        }, {
            "id" : 1,
            "name" : "Tablet (768px - 1260px)"
        }, {
            "id" : 2,
            "name" : "Mobile (320px - 767px)"
        }];
    },

    createTimingFieldSet: function() {
        var me = this;

        var validFrom = Ext.create('Ext.form.field.Date', {
            anchor: '100%',
            submitFormat: 'd.m.Y',
            fieldLabel: '{s name=settings/time_control/start_date}Start date{/s}',
            name: 'validFrom',
            labelWidth: me.defaults.labelWidth - 20
        });

        var validTo = Ext.create('Ext.form.field.Date', {
            anchor: '100%',
            submitFormat: 'd.m.Y',
            fieldLabel: '{s name=settings/time_control/end_date}End date{/s}',
            name: 'validTo',
            labelWidth: me.defaults.labelWidth - 20
        });

        var validFromTime = Ext.create('Ext.form.field.Time', {
            name: 'validFromTime',
            fieldLabel: '{s name=settings/time_control/start_time}Start time{/s}',
            increment: 30,
            validationEvent: false,
            submitFormat: 'H:i',
            anchor: '100%',
            labelWidth: me.defaults.labelWidth - 20
        });

        var validToTime = Ext.create('Ext.form.field.Time', {
            name: 'validToTime',
            fieldLabel: '{s name=settings/time_control/end_time}End time{/s}',
            increment: 30,
            submitFormat: 'H:i',
            anchor: '100%',
            labelWidth: me.defaults.labelWidth - 20
        });

        return {
            xtype: 'fieldset',
            title: '{s name=settings/time_control/title}Time-controlled activation{/s}',
            layout: 'column',
            margin: '20 0 0',
            items: [{
                xtype: 'container',
                columnWidth: 1,
                margin: '0 0 10',
                items: [{
                    xtype: 'button',
                    iconCls: 'sprite-clock--minus',
                    text: '{s name=settings/time_control/reset}Reset time-controlled activation{/s}',
                    handler: function() {
                        var fields = [ validFrom, validTo, validFromTime, validToTime ];

                        Ext.each(fields, function(field) {
                            field.setRawValue(null);
                        });
                    }
                }]
            },{
                xtype: 'container',
                columnWidth: .5,
                margin: '0 10 0 0',
                layout: 'anchor',
                items: [ validFrom, validTo ]
            }, {
                xtype: 'container',
                columnWidth: .5,
                layout: 'anchor',
                margin: '0 0 0 10',
                items: [ validFromTime, validToTime ]
            }]
        };
    },

    createLandingpageFieldset: function() {
        var me = this, fieldset;

        var displayField = Ext.create('Ext.form.field.Display', {
            name: 'link',
            fieldLabel: '{s name=settings/link_action}Link to the landingpage{/s}'
        });

        var mediaSelection = Ext.create('Shopware.MediaManager.MediaSelection', {
            anchor: '100%',
            fieldLabel: '{s name=settings/teaser_image}Teaser image{/s}',
            name: 'landingPageTeaser'
        });

        var seoKeywords = Ext.create('Ext.form.field.Text', {
            name: 'seoKeywords',
            fieldLabel: '{s name=settings/seo_keywords}SEO-Keywords{/s}'
        });

        var seoDescription = Ext.create('Ext.form.field.TextArea', {
            maxLength:150,
            name: 'seoDescription',
            fieldLabel: '{s name=settings/seo_description}SEO-Description{/s}'
        });

        var returnCats = [];
        if(me.emotion.get('categories') && !Ext.isObject(me.emotion.get('categories'))) {
            var categories =  me.emotion.get('categories');

            Ext.each(categories, function(category) {
                returnCats.push(category.id);
            });
            me.emotion.set('categories', returnCats);
        }

        me.categorySearchField = Ext.create('Ext.ux.form.field.BoxSelect', {
            anchor: '100%',
            width: '100%',
            name: 'categories',
            fieldLabel: '{s name=settings/select_categories_field}Select categorie(s){/s}',
            store: me.categoryPathStore,
            valueField: 'id',
            displayField: 'name',
            value: returnCats
        });

        var store = Ext.create('Ext.data.Store', {
            fields: ['display', 'value'],
            data: [{
                display: '{s name=position/lefttop}Left top{/s}',
                value: 'leftTop'
            },{
                display: '{s name=position/leftmiddle}Left middle{/s}',
                value: 'leftMiddle'
            }, {
                display: '{s name=position/leftbottom}Left bottom{/s}',
                value: 'leftBottom'
            }]
        });

        me.positionSelection = Ext.create('Ext.form.field.ComboBox', {
            queryMode: 'local',
            fieldLabel: '{s name=settings/select_position}Select position{/s}',
            store: store,
            displayField: 'display',
            valueField: 'value',
            name: 'landingPageBlock'
        });

        fieldset = Ext.create('Ext.form.FieldSet', {
            margin: '15 0 0',
            title: '{s name=settings/landingpage_settings}Landingpage settings{/s}',
            layout: 'anchor',
            collapsible: true,
            hidden: true,
            defaults: me.defaults,
            items: [ displayField, mediaSelection, seoKeywords, seoDescription, me.categorySearchField, me.positionSelection ]
        });

        return fieldset;
    }
});
//{/block}
