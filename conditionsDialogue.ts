import baseApp = require("../coreplayer-shared-module/baseApp");
import app = require("../../extensions/coreplayer-seadragon-extension/app");
import shell = require("../coreplayer-shared-module/shell");
import utils = require("../../utils");
import dialogue = require("../coreplayer-shared-module/dialogue");

export class ConditionsDialogue extends dialogue.Dialogue {

    $title: JQuery;
    $scroll: JQuery;
    $message: JQuery;

    static SHOW_CONDITIONS_DIALOGUE: string = 'onShowConditionsDialogue';
    static HIDE_CONDITIONS_DIALOGUE: string = 'onHideConditionsDialogue';

    constructor($element: JQuery) {
        super($element);
    }

    create(): void {
        
        this.setConfig('conditionsDialogue');
        
        super.create();

        $.subscribe(ConditionsDialogue.SHOW_CONDITIONS_DIALOGUE, (e, params) => {
            this.open();
        });

        $.subscribe(ConditionsDialogue.HIDE_CONDITIONS_DIALOGUE, (e) => {
            this.close();
        });

        this.$title = $('<h1>' + this.content.title + '</h1>');
        this.$content.append(this.$title);

        this.$scroll = $('<div class="scroll"></div>');
        this.$content.append(this.$scroll);

        this.$message = $('<p></p>');
        this.$scroll.append(this.$message);

        // initialise ui.
        this.$title.text(this.content.title);
        
        var licenseCode = this.provider.getRootSection().extensions.mods.dzLicenseCode;

        var licenseText = this.content[licenseCode] || this.content["A"];

        this.$message.html(licenseText);

        // ensure anchor tags link to _blank.
        this.$message.find('a').prop('target', '_blank');

        this.$element.hide();
    }

    resize(): void {
        super.resize();

    }
}