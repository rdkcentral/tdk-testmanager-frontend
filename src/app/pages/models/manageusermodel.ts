/*
* If not stated otherwise in this file or this component's Licenses.txt file the
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
 * Interface representing a user for management purposes.
 * @property id - Unique identifier for the user
 * @property username - Username of the user
 * @property email - Email address of the user
 * @property name - Full name of the user
 * @property groupname - Group name the user belongs to
 * @property role - Role assigned to the user
 */
export interface UserManageModel {
    id: number;
    username: string;
    email: string;
    name: string;
    groupname: string;
    role: string;
}

/**
 * Interface representing a test group.
 * @property id - Unique identifier for the test group
 * @property name - Name of the test group
 */
export interface testGroupModel {
    id:number,
    name:string
}