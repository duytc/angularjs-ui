module.exports = {
    selectItemByModel: selectItemByModel,
    selectItem: selectItem,
    getDateString: getDateString
};

function selectItemByModel(byModel, dropDownCss, rowId) {
    selectItem(2, byModel, dropDownCss, rowId);
}

function selectItem(byType, byValue, dropDownCss, rowId) {
    switch (byType) {
        case 1:
            element(by.id(byValue)).click();
            break;

        case 2:
            element(by.model(byValue)).click();
            break;

        case 3:
            element(by.css(byValue)).click();
            break;

        case 4:
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
