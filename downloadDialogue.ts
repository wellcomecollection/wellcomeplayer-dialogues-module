import baseExtension = require("../coreplayer-shared-module/baseExtension");
import extension = require("../../extensions/wellcomeplayer-seadragon-extension/extension");
import shell = require("../coreplayer-shared-module/shell");
import utils = require("../../utils");
import dialogue = require("../coreplayer-shared-module/dialogue");
import provider = require("../../extensions/wellcomeplayer-seadragon-extension/provider");

export class DownloadDialogue extends dialogue.Dialogue {

    $title: JQuery;
    $downloadOptions: JQuery;
    $currentViewAsJpgButton: JQuery;
    $wholeImageHighResAsJpgButton: JQuery;
    $wholeImageLowResAsJpgButton: JQuery;
    $entireDocumentAsPdfButton: JQuery;
    $entireFileAsOriginalButton: JQuery;
    $buttonsContainer: JQuery;
    $previewButton: JQuery;
    $downloadButton: JQuery;

    static SHOW_DOWNLOAD_DIALOGUE: string = 'onShowDownloadDialogue';
    static HIDE_DOWNLOAD_DIALOGUE: string = 'onHideDownloadDialogue';

    constructor($element: JQuery) {
        super($element);
    }

    create(): void {

        this.setConfig('downloadDialogue');

        super.create();

        $.subscribe(DownloadDialogue.SHOW_DOWNLOAD_DIALOGUE, (e, params) => {
            this.open();
        });

        $.subscribe(DownloadDialogue.HIDE_DOWNLOAD_DIALOGUE, (e) => {
            this.close();
        });

        // create ui.
        this.$title = $('<h1>' + this.content.title + '</h1>');
        this.$content.append(this.$title);

        this.$downloadOptions = $('<ol class="options"></ol>');
        this.$content.append(this.$downloadOptions);

        this.$currentViewAsJpgButton = $('<li><input id="currentViewAsJpg" type="radio" name="downloadOptions"></input><label for="currentViewAsJpg">' + this.content.currentViewAsJpg + '</label></li>');
        this.$downloadOptions.append(this.$currentViewAsJpgButton);
        this.$currentViewAsJpgButton.hide();

        this.$wholeImageHighResAsJpgButton = $('<li><input id="wholeImageHighResAsJpg" type="radio" name="downloadOptions"></input><label for="wholeImageHighResAsJpg">' + this.content.wholeImageHighResAsJpg + '</label></li>');
        this.$downloadOptions.append(this.$wholeImageHighResAsJpgButton);
        this.$wholeImageHighResAsJpgButton.hide();

        this.$wholeImageLowResAsJpgButton = $('<li><input id="wholeImageLowResAsJpg" type="radio" name="downloadOptions"></input><label for="wholeImageLowResAsJpg">' + this.content.wholeImageLowResAsJpg + '</label></li>');
        this.$downloadOptions.append(this.$wholeImageLowResAsJpgButton);
        this.$wholeImageLowResAsJpgButton.hide();

        this.$entireDocumentAsPdfButton = $('<li><input id="entireDocumentAsPdf" type="radio" name="downloadOptions"></input><label for="entireDocumentAsPdf">' + this.content.entireDocumentAsPdf + '</label></li>');
        this.$downloadOptions.append(this.$entireDocumentAsPdfButton);
        this.$entireDocumentAsPdfButton.hide();

        var fileUri = this.extension.getAssetByIndex(0).fileUri;
        var fileExtension = fileUri.split('.').pop();
        this.$entireFileAsOriginalButton = $('<li><a href="' + fileUri + '?download=true" target="_blank">' + String.prototype.format(this.content.entireFileAsOriginal, fileExtension) + '</a></li>');
        this.$downloadOptions.append(this.$entireFileAsOriginalButton);
        this.$entireFileAsOriginalButton.hide();

        this.$buttonsContainer = $('<div class="buttons"></div>');
        this.$content.append(this.$buttonsContainer);

        this.$previewButton = $('<a class="button" href="#">Preview</a>');
        this.$buttonsContainer.append(this.$previewButton);

        this.$downloadButton = $('<a class="button" href="#">Download</a>');
        this.$buttonsContainer.append(this.$downloadButton);

        // initialise ui.

        // enable download based on license code.
        if (this.isDownloadOptionAvailable("currentViewAsJpg")) {
            this.$currentViewAsJpgButton.show();
        }

        if (this.isDownloadOptionAvailable("wholeImageHighResAsJpg")) {
            this.$wholeImageHighResAsJpgButton.show();
        }

        if (this.isDownloadOptionAvailable("wholeImageLowResAsJpg")) {
            this.$wholeImageLowResAsJpgButton.show();
        }

        if (this.isDownloadOptionAvailable("entireDocumentAsPdf")) {
            this.$entireDocumentAsPdfButton.show();
        }

        if (this.isDownloadOptionAvailable("entireFileAsOriginal")) {
            if (fileExtension !== 'jp2'){
                this.$entireFileAsOriginalButton.show();
                this.$downloadButton.hide();
                this.$previewButton.hide();
            }
        }

        // select first option.
        this.$downloadOptions.find('input:first').prop("checked", true);

        var that = this;

        // ui event handlers.
        this.$previewButton.on('click', () => {
            var selectedOption = this.getSelectedOption();

            var id = selectedOption.attr('id');

            switch (id){
                case 'currentViewAsJpg':
                    //$.wellcome.player.trackAction("Files", "Previewed - Current View");
                    window.open((<extension.Extension>that.extension).getCropUri(false));
                break;
                case 'wholeImageHighResAsJpg':
                    //$.wellcome.player.trackAction("Files", "Previewed - Whole Image High Res");
                    var asset = (<extension.Extension>that.extension).getCurrentAsset();
                    window.open((<provider.Provider>that.provider).getImage(asset, true));
                break;
                case 'wholeImageLowResAsJpg':
                    //$.wellcome.player.trackAction("Files", "Previewed - Whole Image Low Res");
                    var asset = (<extension.Extension>that.extension).getCurrentAsset();
                    window.open((<provider.Provider>that.provider).getImage(asset, false));
                break;
                case 'entireDocumentAsPdf':
                    //$.wellcome.player.trackAction("Files", "Previewed - Entire Document As PDF");
                    window.open((<provider.Provider>that.provider).getPDF());
                break;
            }

            this.close();
        });

        this.$downloadButton.on('click', () => {
            var selectedOption = that.getSelectedOption();

            var id = selectedOption.attr('id');

            switch (id){
                case 'currentViewAsJpg':
                    //$.wellcome.player.trackAction("Files", "Downloaded - Current View");
                    var asset = (<extension.Extension>that.extension).getCurrentAsset();
                    var viewer = (<extension.Extension>that.extension).getViewer();
                    window.open((<provider.Provider>that.provider).getCrop(asset, viewer, true));
                break;
                case 'wholeImageHighResAsJpg':
                    //$.wellcome.player.trackAction("Files", "Downloaded - Whole Image High Res");
                    var asset = (<extension.Extension>that.extension).getCurrentAsset();
                    window.open((<provider.Provider>that.provider).getImage(asset, true, true));
                break;
                case 'wholeImageLowResAsJpg':
                    //$.wellcome.player.trackAction("Files", "Downloaded - Whole Image Low Res");
                    var asset = (<extension.Extension>that.extension).getCurrentAsset();
                    window.open((<provider.Provider>that.provider).getImage(asset, false, true));
                break;
                case 'entireDocumentAsPdf':
                    //$.wellcome.player.trackAction("Files", "Downloaded - Entire Document As PDF");
                    window.open((<provider.Provider>that.provider).getPDF(true));
                break;
            }

            this.close();
        });

        // hide
        this.$element.hide();
    }

    getSelectedOption() {
        return this.$downloadOptions.find("input:checked");
    }

    isDownloadOptionAvailable(option): boolean {
        return this.provider.assetSequence.extensions.permittedOperations.contains(option);
    }

    resize(): void {

        this.$element.css({
            'top': this.extension.height() - this.$element.outerHeight(true)
        });
    }
}
