/**
 * Helper function for converting seconds into months.
 *
 * @param {number} seconds 
 */
export const convertSecondsIntoMonths = (seconds) => {
    return Math.round(seconds / 2_629_800);
};