(function () {
    "use strict";

    angular.module("tagcade.core.language")
        .constant("LOCALE_EN", {
            "LOGIN": "Log in",
            "LOGOUT": "Log Out",
            "EDIT_PROFILE": "Edit Profile",
            "RETURN_TO_ADMIN": "Return to admin account",
            "PASSWORD": "Password",
            "USERNAME": "Username",
            "FORGOT_PASSWORD": "Forgot your password?",
            "CANCEL": "Cancel",
            "NO_CANCEL": "No, cancel",
            "OK_CANCEL": "Ok, cancel",
            "YES_DELETE": "Yes, delete",
            "SUBMIT": "Submit",
            "VALID_FORM": "Submit button will be active only when all fields are valid.",
            "ACTIONS": "Actions",
            "CLOSE": "Close",
            "ALERTS": "Alerts",

            "NAME": "Name",
            "PUBLISHER": "Publisher",
            "CHANNEL": "channel",
            "CHANNELS": "Channels",
            "SITE": "Site",
            "SITES": "Sites",
            "AD_NETWORK": "Ad Network",
            "AD_NETWORKS": "Ad Networks",
            "AD_SLOT": "Ad Slot",
            "AD_SLOTS": "Ad Slots",
            "RON_AD_SLOT": "RON Ad Slot",
            "RON_AD_SLOTS": "RON Ad Slots",
            "DISPLAY_AD_SLOTS": "Display Ad Slots",
            "DYNAMIC_AD_SLOTS": "Dynamic Ad Slots",
            "NATIVE_AD_SLOTS": "Native Ad Slots",
            "DISPLAY_AD_SLOT": "Display Ad Slot",
            "DYNAMIC_AD_SLOT": "Dynamic Ad Slot",
            "NATIVE_AD_SLOT": "Native Ad Slot",
            "AD_TAG": "Ad Tag",
            "AD_TAGS": "Ad Tags",
            "SEGMENT": "Report Segment",
            "SEGMENTS": "Report Segments",

            "RTB_STATUS": "RTB status",
            "RTB_STATUS_INHERIT": "Inherit",
            "RTB_STATUS_ENABLE": "Enable",
            "RTB_STATUS_DISABLE": "Disable",

            "VIEW_TODAY_REPORT": "View Today's Report",
            "COPY_TO_CLIPBOARD": "Copy to Clipboard",

            "EVENT_LISTENER": {
                "LOGIN_FAIL": "Login failed, did you provide an invalid username and/or password?",
                "LOGOUT_SUCCESS": "You are now logged out",
                "SESSION_EXPIRED": "You are not authenticated. This could mean your session expired, please log in again"
            },
            "NAVBAR": {
                "DASHBOARD": "Dashboard",
                "PUBLISHER_MANAGEMENT": "Publisher Management",
                "PUBLISHERS": "Publishers",
                "NEW_PUBLISHER": "New Publisher",
                "TAG_MANAGEMENT": "Tag Management",
                "GENERATE_TAGS": "Generate Tags",
                "CHANNELS": "Channels",
                "MY_CHANNELS": "My Channels",
                "MY_SEGMENTS": "My Report Segments",
                "SITES": "Sites",
                "MY_SITES": "My Sites",
                "AD_SLOTS": "Ad Slots",
                "MY_AD_SLOTS": "My Ad Slots",
                "MY_RON_AD_SLOTS": "My RON Ad Slots",
                "RON_AD_SLOTS": "RON Ad Slots",
                "AD_NETWORKS": "Ad Networks",
                "MY_AD_NETWORKS": "My Ad Networks",
                "AD_TAGS": "Ad Tags",
                "NEW_CHANNEL": "New Channel",
                "NEW_SITE": "New Site",
                "NEW_AD_NETWORK": "New Ad Network",
                "NEW_AD_SLOT": "New Ad Slot",
                "NEW_RON_AD_SLOT": "New RON Ad Slot",
                "NEW_AD_TAG": "New Ad Tag",
                "TAG_LIBRARY": "Tag Library",
                "REPORTS": "Reports",
                "RTB_REPORTS": "RTB Reports",
                "PERFORMANCE_REPORTS": "Performance Reports",
                "SOURCE_REPORTS": "Source Reports",
                "BILLING_REPORTS": "Billing Reports",
                "PROJECTED_BILL": "Projected Bill",
                "TOOLS": "Tools",
                "CPM_EDITOR": "Cpm Editor",
                "CASCADE_MANAGER": "Cascade Manager",
                "SOURCE_REPORT_CONFIG": "Source Report Config",
                "ACTIVITY_LOG": "Activity Log"
            },
            "DASHBOARD_MODULE": {
                "DATE_RANGE": "Date Range",
                "BUTTON_UPDATE": "Update",
                "EARNINGS": "Earnings",
                "TOP_PUBLISHERS": "Top Publishers",
                "TOP_SITES": "Top Sites",
                "TOP_PERFORMERS": "Top Performers",
                "TOP_AD_NETWORKS": "Top Ad Networks",

                "UPDATE_FAIL": "An error occurred while trying to request the dashboard",
                "DAILY_OVERVIEW": "Daily Overview",
                "PLATFORM_OVERVIEW": "Platform Overview",
                "ACCOUNT_OVERVIEW": "Account Overview",
                "DAILY_AVERAGE": "Daily Average",
                "PLATFORM_STATISTICS": "Platform Statistics",

                "ESTIMATED_REVENUE": "Estimated Revenue",
                "BILLED_AMOUNT": "Billed Amount",
                "SLOT_OPPORTUNITIES": "Slot Opportunities",
                "NETWORK_OPPORTUNITIES": "Network Opportunities",
                "IMPRESSIONS": "Impressions",
                "PASSBACKS": "Passbacks",
                "FILL_RATE": "Fill Rate"
            },
            "PUBLISHER_MODULE": {
                "PASSWORD": "Password",
                "USERNAME": "Username",
                "REPEAT_PASSWORD": "Repeat Password",
                "COMPANY": "Company",
                "EMAIL": "Email",
                "FIRST_NAME": "First Name",
                "LAST_NAME": "Last Name",
                "PHONE": "Phone",
                "ADDRESS": "Address",
                "POSTAL_CODE": "Postal Code",
                "CITY": "City",
                "STATE": "State",
                "TAG_DOMAIN": "Tag Domain",
                "COUNTRY": "Country",
                "MODULES": "Modules",
                "BILLING_RATE": "Billing Rate",
                "ENABLED": "Enabled",
                "DISPLAY_BILLING_RATE": "Display billing Rate",
                "ENABLE_HTTPS": "Enable Https",

                "ADD_NEW_SUCCESS": "The publisher has been updated",
                "UPDATE_PROFILE_SUCCESS": "Your profile has been updated successfully",
                "UPDATE_STATUS_FAIL": "Could not change publisher status",
                "PAUSE_STATUS_SUCCESS": "The publisher has been deactivated",
                "ACTIVE_STATUS_SUCCESS": "The publisher has been activated",

                "BACK_TO_PUBLISHER_LIST": "Back to Publisher List",
                "SELECT_A_PUBLISHER": "Select a publisher",
                "NEW_PUBLISHER": "New Publisher",
                "LOGIN_AS_THIS_PUBLISHER": "Login as this publisher",
                "LAST_LOGIN": "Last Login",
                "STATUS": "Status",
                "EDIT_PUBLISHER": "Edit Publisher",
                "DEACTIVATE_PUBLISHER": "Deactivate Publisher",
                "ACTIVATE_PUBLISHER": "Activate Publisher",

                "HELP_BLOCK_REPEAT_PASSWORD": "Leave it blank for no change",
                "HELP_BLOCK_BILLING_RATE": "You can set a custom CPM rate for this publisher. If you do not set a custom rate, the rate is calculated from our rate card.",
                "HELP_BLOCK_TAG_DOMAIN": "This will allow you to pull js tags data from your custom domain."
            },
            "TAG_GENERATOR_MODULE": {
                "GUIDE_COPY_HEADER": "To enable source reports, copy and paste the following tag into the <head> section of your website.",
                "GUIDE_COPY_BODY": "Copy and paste the following ad tags into the <body> section of your website.",
                "GUIDE_PASSBACK": "Give the following tag to your ad networks as a passback/default/fallback tag for display ads.",
                "SELECT_A_SITE_TO_GENERATE": "Select a site to generate tags for...",

                "EXPORT_TAG": "Export Tags",
                "TAGS_FOR_SITE": "Tags for {{ name }}",
                "RON_AD_SLOT_FOR": "{{ name }}",
                "TAGS_FOR_RON_AD_SLOT": "Tags for RON ad slot",
                "HEADER": "Header",
                "AD_SLOT_TYPE": "Ad Slot Type",
                "SELECT_A_AD_SLOT_TYPE": "Select a ad slot type"
            },
            "CHANNEL_MODULE": {
                "ADD_NEW_SUCCESS": "The channel has been created",
                "UPDATE_SUCCESS": "The channel has been updated",
                "UPDATE_FAIL": "The channel could not be updated",
                "DELETE_SUCCESS": "The channel was deleted",
                "DELETE_FAIL": "The channel could not be deleted",
                "REMOVE_SITE_FROM_CHANNEL_SUCCESS": "The site was removed",
                "REMOVE_SITE_FROM_CHANNEL_FAIL": "The site could not be removed",
                "CONFIRM_DELETE_CHANNEL": "Are you sure you want to delete this channel?",
                "CONFIRM_REMOVE_SITE_FROM_CHANNEL": "Are you sure you want to remove this site from the channel?",
                "CONFIRM_DELETE_SUCCESS": "The channel was deleted",
                "CONFIRM_DELETE_FAIL": "The channel could not be deleted",
                "CURRENTLY_NO_CHANNELS": "There is currently no channels",
                "CURRENTLY_NO_SITES_CHANNEL": "There is currently no sites in this channel",

                "MANAGE_SITES": "Manage Sites",
                "EDIT_CHANNEL": "Edit Channel",
                "DELETE_CHANNEL": "Delete Channel",
                "ADD_SITES_FOR": "Add Sites for",
                "BACK_TO_CHANNEL_LIST": "Back to Channel List",
                "ADD_SITES_TO_CHANNEL": "Add Sites to Channel",
                "NEW_CHANNEL": "New Channel",
                "REMOVE_SITE_FROM_CHANNEL": "Remove Site from Channel",

                "PLACEHOLDER_CHANNEL_NAME": "Channel name",

                "HELP_BLOCK_RTB": "If enabled or inherited from publisher that has rtb enabled, all sites of that channel will be enabled real-time bidding feature."
            },
            "SITE_MODULE": {
                "DOMAIN": "Domain",
                "VIDEO_PLAYERS": "Video Players",
                "RTB": "RTB",
                "EXCHANGES" : "Exchanges",

                "ADD_NEW_SUCCESS": "The site has been created",
                "UPDATE_SUCCESS": "The site has been updated",
                "UPDATE_FAIL": "The site could not be updated",
                "REMOVE_CHANNEL_FROM_SITE_SUCCESS": "The channel was removed",
                "REMOVE_CHANNEL_FROM_SITE_FAIL": "The channel could not be removed",
                "CONFIRM_DELETE_SITE": "Are you sure you want to delete this site?",
                "CONFIRM_REMOVE_CHANNEL_FROM_SITE": "Are you sure you want to remove this channel from the site?",
                "DELETE_SUCCESS": "The site was deleted",
                "DELETE_FAIL": "The site could not be deleted",
                "CURRENTLY_NO_SITES": "There is currently no sites",
                "CURRENTLY_NO_CHANNELS_SITE": "There is currently no channels in this site",

                "MANAGE_AD_SLOTS": "Manage Ad Slots",
                "MANAGE_CHANNELS": "Manage Channels",
                "EDIT_SITE": "Edit Site",
                "DELETE_SITE": "Delete Site",
                "BACK_TO_SITE_LIST": "Back to Site List",
                "ADD_CHANNELS_TO_SITE": "Add Channels to Site",
                "NEW_SITE": "New Site",
                "GENERATE_TAGS": "Generate Tags",
                "ADD_CHANNELS_FOR": "Add Channels for",
                "REMOVE_CHANNEL_FROM_SITE": "Remove Channel from Site",

                "SOURCE_REPORT": "Source Report",
                "SELECT_A_SITE": "Select a site",
                "PLACEHOLDER_SITE_NAME": "Site name",
                "PLACEHOLDER_SITE_DOMAIN": "Domain name",
                "ALL_SITES" : "All Sites",
                "AUTO_CREATED_SITES": "Auto Created Sites",
                "MANUALLY_CREATED_SITES": "Manually Created Sites",
                "HELP_BLOCK_SOURCE_REPORT": "If checked, source reports will be created every day for this site",
                "HELP_BLOCK_RTB": "If enabled or inherited from channel that has rtb enabled, all ad slots of that site will be enabled real-time bidding feature."
            },
            "AD_NETWORK_MODULE": {
                "URL": "Url",

                "ADD_NEW_SUCCESS": "The ad network has been created",
                "UPDATE_SUCCESS": "The ad network has been updated",
                "UPDATE_FAIL": "The ad network could not be updated",
                "UPDATE_STATUS_FAIL": "Could not change ad network status",
                "PAUSE_STATUS_SUCCESS": "The ad network has been paused. There may be a short delay before the associated ad tags are paused.",
                "ACTIVE_STATUS_SUCCESS": "The ad network has been activated",
                "CURRENTLY_NO_AD_NETWORK": "There is currently no ad network",
                "CURRENTLY_NO_SITES_AD_NETWORK": "Ad network : ' {{ ad_network_name }} ' does not have sites",
                "CONFIRM_PAUSE_AD_NETWORK": "Are you sure you want to pause this ad network?",
                "NOTE_CONFIRM_PAUSE_AD_NETWORK": "Every ad tag associated with this ad network will be also paused.",
                "CONFIRM_PAUSE_SITE": "Are you sure you want to pause this site?",
                "NOTE_CONFIRM_PAUSE_SITE": "Every ad tag associated with this ad network and site will be also paused.",

                "MANAGE_AD_TAGS": "Manage Ad Tags",
                "EDIT_AD_NETWORK": "Edit Ad Network",
                "SITES_FOR_AD_NETWORK": "Sites for ad network",
                "PLACEHOLDER_AD_NETWORK_NAME": "Ad network name",
                "PLACEHOLDER_AD_NETWORK_URL": "An optional url to this ad network",
                "NEW_AD_NETWORK": "New Ad Network",
                "DROPDOWN_ACTIVE": "Activate Ad Network",
                "DROPDOWN_PAUSE": "Pause Ad Network",
                "DROPDOWN_VISIT_AS_NETWORK": "Visit Ad Network",
                "ADD_NEW_AD_NETWORK": "+ Add New Ad Network",

                "BACK_TO_AD_NETWORK_LIST": "Back to Ad Network List",
                "ACTIVE_AD_TAGS_COUNT": "Active Ad Tags",
                "PAUSE_AD_TAGS_COUNT": "Paused Ad Tags",
                "PAUSE_AD_NETWORK_BY_SITE": "Pause Ad Network by Sites",
                "YES_PAUSE": "Yes, pause",
                "SELECT_A_AD_NETWORK": "Select a ad network",

                "HELP_BLOCK_URL": "You can use this field to add the login url for your ad network."
            },
            "AD_SLOT_MODULE": {
                "NATIVE": "Native",
                "DEFAULT_AD_SLOT": "Default Ad Slot",
                "TYPE": "Type",
                "IN_LIBRARY": "In Library",
                "FROM_LIBRARY": "From Library",
                "LIBRARY_AD_SLOT": "Library Ad Slot",
                "WIDTH": "Width",
                "HEIGHT": "Height",
                "EXPRESSION_BUILDER": "Expression Builder",
                "SIZE": "Size",
                "AUTO_FIT": "Auto Fit",
                "PASSBACK_MODE": "Passback Mode",
                "FLOOR_PRICE": "Floor Price",

                "ADD_NEW_SUCCESS": "The ad slot has been created",
                "ADD_NEW_FAIL": "An error occurred. The ad slot could not be created",
                "UPDATE_SUCCESS": "The ad slot has been updated",
                "UPDATE_FAIL": "An error occurred. The ad slot could not be updated",
                "CLONE_SUCCESS": "The ad slot has been cloned successfully",
                "CLONE_FAIL": "Could not clone the ad slot",
                "DELETE_SUCCESS": "The ad slot was deleted",
                "DELETE_FAIL": "The ad slot could not be deleted",
                "CONFIRM_DELETE_AD_SLOT": "Are you sure you want to delete this ad slot?",
                "CURRENTLY_NO_AD_SLOT": "There is currently no ad slots in this site",
                "MOVED_TO_LIBRARY_SUCCESS": "The ad slot has been moved to the library",
                "MOVED_TO_LIBRARY_FAIL": "The ad slot has not been moved to the library",

                "BACK_TO_AD_SLOT_LIST": "Back to Ad Slot List",
                "SELECT_A_TYPE": "Select a type",
                "SELECT_A_PASS_BACK": "Select a passback",
                "GENERATE_AD_TAGS": "Generate Ad Tags",
                "GENERATE_A_TAGS": "Generate a Tag",
                "TAG_FOR_NAME": "Tag for: {{ name }}",
                "SELECT_A_AD_SLOT": "Select an ad slot",

                "MANAGE_AD_TAGS": "Manage Ad Tags",
                "EDIT_AD_SLOT": "Edit Ad Slot",
                "CLONE_AD_SLOT": "Clone Ad Slot",
                "DELETE_AD_SLOT": "Delete Ad Slot",
                "MOVE_TO_LIBRARY": "Move To Library",
                "EDIT_AD_SLOT_IN_LIBRARY": "Edit Ad Slot in The Library",
                "NEW_AD_SLOT": "New Ad Slot",

                "PLACEHOLDER_AD_SLOT_NAME": "Ad Slot name",
                "HELP_BLOCK_COPY_TAG": "Copy and paste the following ad tag into the <body> section of your website.",
                "HELP_BLOCK_FROM_LIBRARY": "You can select an existing ad slot from your library. If you choose this option, all of the fields below will not be editable. If you would like to change these fields, you may do so the the Tag Library section.",
                "HELP_BLOCK_DEFAULT_AD_SLOT": "If no default ad slot is selected and no expressions match, the ad slot will not be shown on the page.",
                "HELP_BLOCK_AUTO_FIT": "When Auto Fit is enabled, the ad slot will dynamically resize if the ad served is different from the size defined above.",
                "HELP_BLOCK_FLOOR_PRICE": "This is the lowest price to be accepted in RTB auction. The winning bidder is the one whose bid price is highest among bidders and it must be higher than or equal to this price. Otherwise regular ad tag display will be executed.",
                "HELP_BLOCK_RTB": "If enabled or inherited from site that has rtb enabled, the display of tag will be auctioned to find higher revenue compares to regular ad tag display"
            },
            "RON_AD_SLOT_MODULE": {
                "CURRENTLY_NO_RON_AD_SLOT": "There is currently no RON ad slots",
                "ADD_NEW_SUCCESS": "The RON ad slot has been created",
                "ADD_NEW_FAIL": "An error occurred. The RON ad slot could not be created",
                "UPDATE_SUCCESS": "The RON ad slot has been updated",
                "UPDATE_FAIL": "An error occurred. The RON ad slot could not be updated",
                "DELETE_SUCCESS": "The RON ad slot was deleted",
                "DELETE_FAIL": "The RON ad slot could not be deleted",
                "CONFIRM_DELETE_RON_AD_SLOT": "Are you sure you want to delete this RON ad slot?",

                "REFERENCE_LIBRARY_AD_SLOT": "Reference Library",
                "LIBRARY_AD_SLOT": "Library Ad Slot",
                "BACK_TO_AD_SLOT_LIST": "Back to RON Ad Slot List",
                "SELECT_LIBRARY_AD_SLOT": "Select library ad slot",
                "PICK_FROM_LIBRARY": "Pick from library",
                "NEW_RON_AD_SLOT": "New RON Ad Slot",
                "EDIT_RON_AD_SLOT": "Edit RON Ad Slot",
                "DELETE_RON_AD_SLOT": "Delete RON Ad Slot",
                "SEGMENTS": "Report Segments",
                "SHOW_DETAILS": 'Show Details',
                "SEGMENT_NOTHING_IS_SELECTED": 'Nothing is selected',
                "HELP_BLOCK_SELECT_SEGMENT": "You can create custom report segments above. To create new segments, enter in a text value and press enter. You may repeat this process to create more segments",
                "HELP_BLOCK_GLOBAL": "You can generate unique tags for each report segment. The Global segment is the default report segment and should be used when you do not have any custom segments or do not want to track a specific segment.",
                "HELP_BLOCK_RTB": "If enabled or inherited from publisher that has rtb module enabled, the display of tag will be auctioned to find higher revenue compares to regular ad tag display"
            },
            "SEGMENT_MODULE": {
                "CURRENTLY_SEGMENT": "There is currently no report segments in the library",
                "DELETE_SUCCESS": "The report segment was deleted",
                "DELETE_FAIL": "The report segment could not be deleted",
                "CONFIRM_DELETE_SEGMENT": "Are you sure you want to delete this report segment?",

                "DELETE_SEGMENT": "Delete Report Segment",
                "SELECT_A_SEGMENT": "Select Segment",
                "GLOBAL_REPORT_SEGMENT": "Global"
            },
            "AD_TAG_MODULE": {
                "ADD_NEW_SUCCESS": "The ad tag has been created",
                "UPDATE_SUCCESS": "The ad tag has been updated",
                "UPDATE_FAIL": "The ad tag has not been updated",
                "DELETE_SUCCESS": "The ad tag was deleted",
                "DELETE_FAIL": "The ad tag could not be deleted",
                "CHANGE_STATUS_FAIL": "Could not change ad tag status",
                "REORDERED_AD_TAG_FAIL": "The ad tags could not be reordered",
                "REORDERED_AD_TAG_SUCCESS": "The ad tags have been reordered",
                "MOVED_TO_LIBRARY_SUCCESS": "The ad tag has been moved to the library",
                "MOVED_TO_LIBRARY_FAIL": "The ad tag has not been moved to the library",
                "CONFIRM_DELETE_AD_TAG": "Are you sure you want to delete this ad tag?",
                "CURRENTLY_NO_AD_TAG": "There is currently no ad tags in this ad slot",

                "BACK_TO_AD_TAG_LIST": "Back to Ad Tag List",
                "FROM_LIBRARY": "From Library",
                "LIBRARY_AD_TAG": "Library Ad Tag",
                "SELECT_AN_AD_TAG_FROM_LIBRARY": "Select an ad tag from library",
                "AD_TYPE": "Ad Type",
                "CUSTOM_AD": "Custom Ad",
                "IMAGE_AD": "Image Ad",
                "IMAGE_URL": "Image Url",
                "TARGET_URL": "Target Url",
                "HTML": "Html",
                "POSITION": "Position",
                "PLACEHOLDER_POSITION": "Position (leave blank for last position)",
                "ROTATION_WEIGHT": "Rotation Weight",
                "FREQUENCY_CAP": "Frequency Cap",
                "ACTIVE": "Active",
                "AD_TAG_NAME": "Ad tag name",

                "ENABLE_DRAG_DROP": "Enable Drag/Drop",
                "NEW_AD_TAG": "New Ad Tag",
                "STATUS": "Status",
                "IN_LIBRARY": "In Library",
                "EDIT_AD_TAG": "Edit Ad Tag",
                "PAUSE_AD_TAG" : "Pause Ad Tag",
                "ACTIVATE_AD_TAG" : "Activate Ad Tag",
                "DELETE_AD_TAG": "Delete Ad Tag",
                "MOVE_TO_LIBRARY": "Move To Library",
                "EDIT_AD_TAG_IN_LIBRARY": "Edit Ad Tag in The Library",
                "SPLIT_GROUP": "Split Group",

                "HELP_BLOCK_FROM_LIBRARY": "You can select an existing ad tag from your library. If you choose this option some of the fields below will not be editable. If you would like to change these fields, you may do so the the Tag Library section.",
                "HELP_BLOCK_FREQUENCY_CAP": "Maximum number of network opportunities per day per user for this ad tag, leave blank for no cap.",
                "HELP_BLOCK_HTML": "You can use the following macros in your ad tag",
                "HELP_BLOCK_TARGET_URL": "You can use the following macros in your target url",
                "HELP_BLOCK_CACHE_BUSTER": "A unique code that ensures URLs are unique",
                "HELP_BLOCK_PAGE_URL": "The url of the current page",
                "HELP_BLOCK_DOMAIN": "The domain of the current website",

                "GUIDE_DRAG_DROP_TITLE": "You can drag and drop to re-order your ad tags.",
                "GUIDE_DRAG_DROP_GROUP_AD_TAG": "To move all ad tags from one position group to another, click and drag the gray position header bar up and down.",
                "GUIDE_DRAG_DROP_AD_TAG": "To move a single ad tag to another position, click and drag on that ad tag only.",
                "GUIDE_SPLIT_GROUP": "To quickly remove an ad tag from a position group, click on Actions > Split Group."
            },
            "AD_SLOT_LIBRARY_MODULE": {
                "REMOVE_SUCCESS": "The ad slot was removed from the library successfully",
                "REMOVE_FAIL": "Could not remove the ad slot from the library",
                "AD_SLOT_FOR_SITE_SUCCESS": "New ad slots have been added to the selected sites",
                "AD_SLOT_FOR_SITE_FAIL": "Could not add new ad slots",
                "CURRENTLY_NO_AD_SLOT": "There is currently no ad slots in the library",
                "CURRENTLY_NO_AD_SLOT_ASSOCIATED": "This ad slot is currently not linked to any sites",
                "ALERT_CREATE_LINKED_AD_SLOTS_FULL_SITE": "Every site already has a link to this ad slot",

                "TITLE_CREATE_LINKED_AD_SLOTS": "Create Linked Ad Slots",
                "CREATE_RON_AD_SLOT": "Create RON Ad Slot",
                "EDIT_RON_AD_SLOT": "Edit RON Ad Slot",
                "GO_TO_SITE": "Go To Site",
                "IN_RON_AD_SLOT": "Ron Ad Slot",

                "CREATE_LINKED_AD_SLOTS": "Create Linked Ad Slots",
                "VIEW_LINKED_AD_SLOTS": "View Linked Ad Slots",
                "LINKED_AD_SLOTS": "Linked Ad Slots"
            },
            "AD_TAG_LIBRARY_MODULE": {
                "REMOVE_SUCCESS": "The ad tag was removed from the library successfully",
                "REMOVE_FAIL": "Could not remove ad tag from library",
                "CURRENTLY_NO_AD_TAG": "There is currently no ad tags in the library",
                "CURRENTLY_NO_AD_TAG_ASSOCIATED": "This ad tag is currently not linked to any other ad tag",

                "LIBRARY_AD_SLOT": "Library Ad Slot",

                "GO_TO_AD_SLOT": "Go To Ad Slot",
                "VIEW_LINKED_AD_TAGS": "View Linked Ad Tags",
                "LINKED_AD_TAGS": "Linked Ad Tags"
            },
            "REPORT": {
                "DATE_RANGE": "Date Range",
                "REPORT_TYPE": "Report Type",
                "SELECT_A_REPORT_TYPE": "Select a report type",
                "BREAKDOWN": "Breakdown",
                "SELECT_AN_OPTION": "Select an option",
                "GET_REPORTS": "Get Reports",
                "DAILY_ACCOUNT_BREAKDOWN": "Daily Account Breakdown",
                "DAILY_SITE_BREAKDOWN": "Daily Site Breakdown",
                "DAILY_AD_SLOT_BREAKDOWN": "Daily Ad Slot Breakdown",
                "DAILY_RON_AD_SLOT_BREAKDOWN": "Daily RON Ad Slot Breakdown",
                "DAILY_AVERAGES": "Daily Averages",
                "AD_NETWORK_BREAKDOWN": "Ad Network Breakdown",
                "SITE_BREAKDOWN": "Site Breakdown",
                "SEGMENT_BREAKDOWN": "Report Segment Breakdown",
                "AD_SLOT_BREAKDOWN": "Ad Slot Breakdown",
                "AD_TAG_BREAKDOWN": "Ad Tag Breakdown",
                "DAILY_BREAKDOWN": "Daily Breakdown",
                "PUBLISHER_BREAKDOWN": "Publisher Breakdown",
                "TOTALS": "Totals",

                "START_DATE": "Start Date",
                "END_DATE": "End Date",
                "DATE": "Date",

                "BILLED_AMOUNT": "Billed Amount",
                "SLOT_OPPORTUNITIES": "Slot Opportunities",
                "NETWORK_OPPORTUNITIES": "Network Opportunities",
                "IMPRESSIONS": "Impressions",
                "RTB_IMPRESSIONS": "RTB Impressions",
                "PASSBACKS": "Passbacks",
                "FILL_RATE": "Fill Rate",
                "BILLED_CPM_RATE": "Billed CPM Rate",
                "CPM_RATE": "CPM Rate",
                "FIRST_OPPORTUNITIES": "First Opportunities",
                "VERIFIED_IMPRESSIONS": "Verified Impressions",
                "UNVERIFIED_IMPRESSIONS": "Unverified Impressions",
                "BLANK_IMPRESSIONS": "Blank Impressions",
                "VOID_IMPRESSIONS": "Void Impressions",
                "CLICKS": "Clicks",
                "TIER_FILL_RATE": "Tier Fill Rate",
                "POSITION": "Position",

                "PROJECTED_BILL": "Projected Bill",

                "REPORTS_EMPTY": "There are no reports for that selection",
                "REPORT_FAIL": "An error occurred trying to request the report"
            },
            "PERFORMANCE_REPORT_MODULE": {
                "UPDATE_CPM_SUCCESS": "The CPM value has been scheduled for updating",
                "UPDATE_CPM_FAIL": "An error occurred. The CPM value could not be updated",
                "MANAGE_AD_TAGS": "Manage Ad Tags",

                "UPDATE_CPM": "Update CPM",
                "TITLE_UPDATE_CPM": "Update CPM",
                "TITLE_AD_NETWORK_INFO": "Ad Network Info",
                "TITLE_AD_SLOT_INFO": "Ad Slot Info",
                "TITLE_AD_TAG_INFO": "Ad Tag Info",
                "TITLE_SITE_INFO": "Site Info",
                "TITLE_PUBLISHER_INFO": "Publisher Info",
                "TITLE_SEGMENT_INFO": "Report Segment Info",

                "AD_NETWORK_INFO": "Ad Network Info",
                "AD_SLOT_INFO": "Ad Slot Info",
                "RON_AD_SLOT_INFO": "RON Ad Slot Info",
                "AD_TAG_INFO": "Ad Tag Info",
                "SITE_INFO": "Site Info",
                "PUBLISHER_INFO": "Publisher Info",

                "DRILL_DOWN": "Drill Down",
                "EDIT_THIS_AD_NETWORK": "Edit This Ad Network",
                "EDIT_THIS_AD_SLOT": "Edit This AdSlot",
                "EDIT_THIS_RON_AD_SLOT": "Edit This RON AdSlot",
                "EDIT_THIS_AD_TAG": "Edit This AdTag",
                "EDIT_THIS_SITE": "Edit This Site",
                "EDIT_THIS_PUBLISHER": "Edit This Publisher",

                "EDIT_AD_NETWORK": "Edit Ad Network",
                "EDIT_AD_SLOT": "Edit Ad Slot",
                "EDIT_RON_AD_SLOT": "Edit RON Ad Slot",
                "EDIT_AD_TAG": "Edit AdTag",
                "EDIT_SITE": "Edit Site",
                "EDIT_PUBLISHER": "Edit Publisher"
            },
            "SOURCE_REPORT_MODULE": {
                "GET_REPORT_FAIL": "An error occurred while getting reports.",
                "NO_REPORT_FOR_SELECTION": "There is no report for that selection",
                "BREAKDOWN_BY_TRAFFIC_SOURCE": "Breakdown by Traffic Source",

                "TRACKING_KEYS": "Tracking Keys",
                "VISITS": "Visits",
                "PAGE_VIEWS": "Page Views",
                "VIEWS_PER_VISIT": "Views Per Visit",
                "QTOS": "QTOS",
                "QTOS_PERCENTAGE": "QTOS %",
                "QUALITY_TIME_ON_SITE_PERCENTAGE": "Quality Time on Site %",
                "USER": "User",
                "DISPLAY": "Display",
                "DISPLAY_IMPRESSIONS": "Display Impressions",
                "DISPLAY_FILL_RATE": "Display Fill Rate",
                "DISPLAY_CLICKS": "Display Clicks",
                "VIDEO": "Video",
                "SLOT_OPPORTUNITIES": "Slot Opportunities",
                "IMPRESSIONS": "Impressions",
                "FILL_RATE": "Fill Rate",
                "CLICKS": "Clicks",
                "CTR": "CTR",
                "IPV": "IPV",
                "PLAYER_READY": "Player Ready",
                "AD_PLAYS": "Ad Plays",
                "AD_IMPRESSIONS": "Ad Impressions",
                "AD_COMPLETIONS": "Ad Completions",
                "AD_COMPLETION_RATE": "Ad Completion Rate",
                "AD_CLICKS": "Ad Clicks",
                "DISPLAY_CTR": "Display CTR",
                "DISPLAY_IPV": "Display IPV",
                "VIDEO_AD_PLAYS": "Video Ad Plays",
                "VIDEO_AD_IMPRESSIONS": "Video Ad Impressions",
                "VIDEO_AD_COMPLETIONS": "Video Ad Completions",
                "VIDEO_AD_COMPLETION_RATE": "Video Ad Completion Rate",
                "VIDEO_IPV": "Video IPV",
                "VIDEO_AD_CLICKS": "Video Ad Clicks"
            },
            "UNIFIED_REPORT_MODULE": {
                "AVERAGES": "Averages",
                "BACKUP_IMPS": "Backup Impressions",
                "AVG_CPM": "Avg Cpm",
                "FILL_RATE": "Fill Rate",
                "PAID_IMPS": "Paid Impressions",
                "REVENUE": "Revenue",
                "TOTAL_IMPS": "Total Impressions",
                "SIZE": "Size",

                "SEARCH": "Search",
                "AD_TAG_GROUP": "Ad Tag Group",
                "COUNTRY": "Country",
                "CPM": "Cpm",
                "PUB_PAYOUT": "Pub Payout",
                "ASK_PRICE": "Ask Price"
            },
            "RTB_REPORT_MODULE": {
                "EARNED_AMOUNT": "Earned Amount",
                "OPPORTUNITIES": "Opportunities"
            },
            "ACTION_LOG_MODULE": {
                "DATE_RANGE": "Date Range",
                "BUTTON_GET_LOGS": "Get Logs",
                "NAV_ACTION": "Action",
                "NAV_LOGIN": "Login",

                "IP": "IP",
                "ACTION": "Action",
                "USERNAME": "User Name",
                "TIME": "Time",
                "DESCRIPTION": "Description",

                "TITLE_ACTIVITY_LOGS": "Activity Logs",
                "GET_ACTION_LOG_FAIL": "An error occurred during the request"
            },
            "CASCADE_MODULE": {
                "POSITION": "Position",
                
                "UPDATE_SUCCESS": "The ad network position has been updated",
                "UPDATE_FAIL": "An error occurred. The position could not be updated"
            },
            "CPM_EDITOR_MODULE": {
                "UPDATE_SUCCESS": "The CPM value has been scheduled for updating",
                "UPDATE_FAIL": "An error occurred. The CPM value could not be updated",

                "UPDATE_CPM_FOR": "Update CPM For",
                "SELECT_AN_OPTION": "Select an option",
                "DATE_RANGE": "Date Range",
                "CPM_RATE": "CPM Rate"
            },
            "SOURCE_CONFIG_MODULE": {
                "CONFIRM_INCLUDE_ALL": "All reports are sent to this email. Please uncheck the option to include all to configure this email manually",
                "CONFIRM_DELETE_CONFIG": "Are you sure you want to delete this config?",

                "UPDATE_EMAIL_SUCCESS": "The email config has been updated",
                "UPDATE_EMAIL_FAIL": "The email config could not be updated",
                "CLONE_EMAIL_SUCCESS": "The email config has been clone",
                "CLONE_EMAIL_FAIL": "The email config could not be clone",
                "DELETE_EMAIL_SUCCESS": "The email config has been deleted",
                "DELETE_EMAIL_FAIL": "The email config could not be deleted",
                "CURRENTLY_NO_SITE_CONFIG": "There is currently no site config",

                "DELETE_SITE_SUCCESS": "The site config has been deleted",
                "DELETE_SITE_FAIL": "The site config could not be deleted",

                "ADD_SITES_CONFIG_FOR_EMAIL": "Add Site Config For Email",

                "AVAILABLE_SITES": "Available Sites",
                "SELECTED_SITES": "Selected Sites",
                "EDIT_EMAIL_CONFIG": "Edit Email Config",
                "RECEIVING_EMAIL": "Receiving Email",
                "ACTIVE": "Active",
                "INCLUDE_ALL": "Include All",
                "INCLUDE_ALL_SITES": "Include All Sites Of Publishers",
                "INCLUDE": "Include",
                "SHOW_DETAILS": 'Show Details',

                "BACK": "Back",
                "NEW_SITE_CONFIG": "New Site Config",
                "MANAGE_SITE_CONFIG": "Manage Site Config",
                "EDIT_THIS_CONFIG": "Edit This Config",
                "DELETE_THIS_CONFIG": "Delete This Config",
                "NEW_CONFIGURATION": "New Configuration",
                "ADD_NEW_EMAIL_CONFIG": "Add New Email Config",
                "CONFIGURATION": "Configuration",
                "EMAIL": "Email",
                "SITES_CONFIGS": "Site Configs",
                "STATUS": "Status",
                "PLACEHOLDER_EMAIL_ADDRESS": "Email Address",
                "ADD_ANOTHER_EMAIL": "Add another email"
            },
            "ERROR_PAGE": {
                "400": "An invalid request was sent to the server",
                "403": "You do not have the required permissions to access this",
                "404": "The requested resource could not be found",
                "500": "An error occurred"
            },
            "RESET_PASSWORD_MODULE": {
                "RESET": "Reset",
                "USERNAME_EMAIL": "Username or email",
                "NEW_PASSWORD": "New password",
                "REPEAT_PASSWORD": "Repeat password",
                "RESET_PASSWORD": "Reset password",

                "SEND_EMAIL_SUCCESS": "An email has been sent to '{{ username }}'. It contains a link you must click to reset your password",
                "SEND_EMAIL_FAIL": "Could not reset password for '{{ username }}'",
                "RESET_SUCCESS": "Change successful, login to continue",
                "TOKEN_NOT_EXISTED": "The token '{{ token }}' does not exist",
                "TOKEN_EXPIRED": "The token '{{ token }}' is expired. Please try to reset password again",
                "INTERNAL_ERROR": "Internal error. Please contact administrator for further instructions",

                "HELP_BLOCK_CHECK_EMAIL": "Enter your username or email address that you used to register. We'll send you an email with your username and a link to reset your password."
            },
            "QUERY_BUILDER": {
                "ADD_EXPRESSION": "Add Expression",
                "EXPRESSION": "Expression",
                "SHOW_GENERATED_EXPRESSION": "Show generated expression",
                "ENABLE_DRAG_DROP": "Enable Drag/Drop",
                "STARTING_POSITION": "Starting Position",
                "SELECT_A_POSITION": "Select a position",
                "ADD_CONDITION": "Add Condition",
                "ADD_GROUP": "Add Group",

                "HELP_BLOCK_STARTING_POSITION": "Default position is the position of first ad tag found in this ad slot"
            }
        });
})();