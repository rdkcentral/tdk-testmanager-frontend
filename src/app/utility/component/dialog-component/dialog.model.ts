

/*
* If not stated otherwise in this file or this component's LICENSE file the
* following copyright and licenses apply:
*
* Copyright 2024 RDK Management
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*
http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

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