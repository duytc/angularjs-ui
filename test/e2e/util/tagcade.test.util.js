module.exports = {
    selectItemByModel: selectItemByModel,
    selectItem: selectItem,
    getDateString: getDateString,
    selectAdSlotTypeDisplay: selectAdSlotTypeDisplay,
    selectAdSlotTypeNative: selectAdSlotTypeNative,
    selectAdSlotTypeDynamic: selectAdSlotTypeDynamic
};

const BY_ID = 1;
const BY_MODEL = 2;
const BY_CSS = 3;

const ADSLOT_TYPE_DISPLAY = 0;
const ADSLOT_TYPE_NATIVE = 1;
const ADSLOT_TYPE_DYNAMIC = 2;

function selectItemByModel(byModel, dropDownCss, rowId) {
    selectItem(BY_MODEL, byModel, dropDownCss, rowId);
}

function selectItem(byType, byValue, dropDownCss, rowId) {
    switch (byType) {
        case BY_ID:
            element(by.id(byValue)).click();
            break;

        case BY_MODEL:
            element(by.model(byValue)).click();
            break;

        case BY_CSS:
            element(by.css(byValue)).click();
            break;

        default:
            console.log('unknown byType=' + byType);
            return;
    }

    element.all(by.css(dropDownCss)).then(function (items) {
        items[rowId].click();
    });
}

function getDateString(date) {
    return date.toISOString();
}

function selectAdSlotTypeDisplay(byModelValue) {
    selectAdSlotType('display', byModelValue);
}

function selectAdSlotTypeNative(byModelValue) {
    selectAdSlotType('native', byModelValue);
}

function selectAdSlotTypeDynamic(byModelValue) {
    selectAdSlotType('dynamic', byModelValue);
}

function selectAdSlotType(adSlotType, byModelValue) {
    if (adSlotType === 'display') {
        selectItemByModel(byModelValue, '.ui-select-choices-row-inner', ADSLOT_TYPE_DISPLAY);
        return;
    }

    if (adSlotType === 'native') {
        selectItemByModel(byModelValue, '.ui-select-choices-row-inner', ADSLOT_TYPE_NATIVE);
        return;
    }

    if (adSlotType === 'dynamic') {
        selectItemByModel(byModelValue, '.ui-select-choices-row-inner', ADSLOT_TYPE_DYNAMIC);
        return;
    }

    console.log('unknown ad slot type=' + adSlotType);
}
