import baseExtension = require("../coreplayer-shared-module/baseExtension");
import extension = require("../../extensions/coreplayer-seadragon-extension/extension");
import shell = require("../coreplayer-shared-module/shell");
import utils = require("../../utils");
import dialogue = require("../coreplayer-shared-module/dialogue");

export class RestrictedFileDialogue extends dialogue.Dialogue {

    $message: JQuery;
    $nextItemButton: JQuery;
    $joinButton: JQuery;
    $title: JQuery;

    requestedIndex: number;

    static SHOW_RESTRICTED_FILE_DIALOGUE: string = 'onShowRestrictedFileDialogue';
    static HIDE_RESTRICTED_FILE_DIALOGUE: string = 'onHideRestrictedFileDialogue';
    static NEXT_ITEM: string = 'onNextItem';

    constructor($element: JQuery) {
        super($element);
    }

    create() {

        this.setConfig('restrictedFileDialogue');

        super.create();

        $.subscribe(RestrictedFileDialogue.SHOW_RESTRICTED_FILE_DIALOGUE, (e, params) => {

            this.open();
            this.requestedIndex = params.requestedIndex;
            this.allowClose = params.allowClose;

            // reset ui.
            this.$nextItemButton.hide();

            if (this.provider.assetSequence.assets.length > 1) {
                this.$nextItemButton.show();
            }

            if (this.allowClose) {
                this.enableClose();
            } else {
                this.disableClose();
            }
        });

        $.subscribe(RestrictedFileDialogue.HIDE_RESTRICTED_FILE_DIALOGUE, () => {
            this.close();
        });

        // create ui.

        this.$title = $('<h1>' + this.content.title + '</h1>');
        this.$content.append(this.$title);

        this.$content.append('\
            <div>\
                <p class="message"></p>\
                <a class="nextItem" href="#"></a>\
                <a class="join" target="_blank"></a>\
            </div>'
        );

        this.$message = this.$content.find(".message");
        this.$message.html(this.content.message);

        this.$nextItemButton = this.$content.find(".nextItem");
        this.$nextItemButton.text(this.content.nextItem);

        this.$joinButton = this.$content.find('a.join');
        this.$joinButton.text(this.content.joinLibrary);
        this.$joinButton.prop("href", this.options.joinLibraryUri);

        // initialise ui.

        // ui event handlers.
        this.$nextItemButton.on('click', (e) => {
            e.preventDefault();

            $.publish(RestrictedFileDialogue.NEXT_ITEM, [this.requestedIndex]);

            this.close();
        });

        // hide
        this.$element.hide();
    }

}
