(function () {
    "use strict";

    angular.module("tagcade.core.language")
        .constant("LOCALE_EN", {
            "LOGIN": "Log in",
            "PASSWORD": "Password",
            "USERNAME": "Username",
            "FORGOT_PASSWORD": "Forgot your password?",
            "CANCEL": "Cancel",
            "NO_CANCEL": "No, cancel",
            "YES_DELETE": "Yes, delete",
            "SUBMIT": "Submit",
            "VALID_FORM": "Submit button will be active only when all fields are valid.",
            "ACTIONS": "Actions",
            "MANAGE": "Manage",
            "EDIT": "Edit",
            "DELETE": "Delete",

            "NAME": "Name",
            "SITE": "Site",
            "CHANNEL": "channel",
            "PUBLISHER": "Publisher",
            "SITES": "Sites",
            "CHANNELS": "Channels",
            "AD_SLOT": "Ad Slot",
            "AD_SLOTS": "Ad Slots",

            "VIEW_TODAY_REPORT": "View Today's Report",

            "CHANNEL_MODUlE": {
                "ADD_NEW_SUCCESS": "The channel has been created",
                "UPDATE_SUCCESS": "The channel has been updated",
                "UPDATE_FAIL": "The channel could not be updated",
                "DELETE_SUCCESS": "The channel was deleted",
                "DELETE_FAIL": "The channel could not be deleted",
                "REMOVE_SITE_FROM_CHANNEL_SUCCESS": "The site was removed",
                "REMOVE_SITE_FROM_CHANNEL_FAIL": "The site could not be removed",
                "CONFIRM_DELETE_CHANNEL": "Are you sure you want to delete this channel ?",
                "CONFIRM_REMOVE_SITE_FROM_CHANNEL": "Are you sure you want to remove site from channel ?",
                "CONFIRM_DELETE_SUCCESS": "The channel was deleted",
                "CONFIRM_DELETE_FAIL": "The channel could not be deleted",
                "CURRENTLY_NO_CHANNELS": "There is currently no channels",
                "CURRENTLY_NO_SITE_CHANNELS": "There is currently no sites in this channel",

                "ADD_SITES_FOR": "Add Sites for",
                "BACK_TO_CHANNEL_LIST": "Back to Channel List",
                "ADD_SITES_TO_CHANNEL": "Add Sites to Channel",
                "PLACEHOLDER_CHANNEL_NAME": "Channel name",
                "NEW_CHANNEL": "New Channel",
                "SELECT_A_PUBLISHER": "Select a publisher",
                "GENERATE_TAGS": "Generate Tags",
                "REMOVE_SITE_FROM_CHANNEL": "Remove Site from Channel"
            },

            "SITE_MODUlE": {
                "DOMAIN": "Domain",

                "DELETE_SUCCESS": "The site was deleted",
                "DELETE_FAIL": "The Site could not be deleted"
            }
        });
})();