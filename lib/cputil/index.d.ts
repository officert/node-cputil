export declare enum StarPrinterType {
    THERMAL_2 = "thermal2",
    THERMAL_3 = "thermal3",
    THERMAL_4 = "thermal4"
}
export declare enum StarContentType {
    STAR_PRNT = "application/vnd.star.starprnt"
}
/**
 * @desc takes a string of Star Prnt MarkUp and converts it to a format that can be handed to Star printers for printing.
 * @param {String} text
 * @returns {String}
 */
export declare const convertStarPrintMarkUp: (text: string, outputFormat: StarContentType, printerType?: StarPrinterType | undefined) => Promise<any>;
