/**
 * Interface representing the data structure for delete dialog.
 * @property title The title of the dialog.
 * @property msg The message to display in the dialog.
 * @property name The name associated with the delete action.
 * @property [cancel] Optional flag to indicate if cancel is available.
 */
export interface DeleteData {
    title: string;
    msg: string;
    name: string;
    cancel?: boolean;
}