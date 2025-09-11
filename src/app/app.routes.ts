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
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login/login.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { MainComponent } from './layout/main/main.component';
import { ConfigureComponent } from './pages/configure/configure.component';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { UserListComponent } from './pages/user-management/user-list/user-list.component';
import { UserAddComponent } from './pages/user-management/user-add/user-add.component';
import { UserEditComponent } from './pages/user-management/user-edit/user-edit.component';
import { GroupListComponent } from './pages/create-group/group-list/group-list.component';
import { GroupAddComponent } from './pages/create-group/group-add/group-add.component';
import { GroupEditComponent } from './pages/create-group/group-edit/group-edit.component';
import { roleGuard } from './auth/role.guard';
import { authGuard } from './auth/auth.guard';
import { DevicesComponent } from './pages/devices/devices.component';
import { DeviceCreateComponent } from './pages/devices/device-create/device-create.component';
import { DeviceEditComponent } from './pages/devices/device-edit/device-edit.component';
import { ModulesListComponent } from './pages/modules/modules-list/modules-list.component';
import { ParameterListComponent } from './pages/modules/parameter-list/parameter-list.component';
import { FunctionListComponent } from './pages/modules/function-list/function-list.component';
import { ModulesCreateComponent } from './pages/modules/modules-create/modules-create.component';
import { FunctionCreateComponent } from './pages/modules/function-create/function-create.component';
import { ParameterCreateComponent } from './pages/modules/parameter-create/parameter-create.component';
import { ListPrimitiveTestComponent } from './pages/primitive-test/list-primitive-test/list-primitive-test.component';
import { CreatePrimitiveTestComponent } from './pages/primitive-test/create-primitive-test/create-primitive-test.component';
import { ModulesEditComponent } from './pages/modules/modules-edit/modules-edit.component';
import { FunctionEditComponent } from './pages/modules/function-edit/function-edit.component';
import { ParameterEditComponent } from './pages/modules/parameter-edit/parameter-edit.component';
import { ScriptListComponent } from './pages/script/script-list/script-list.component';
import { CreateScriptsComponent } from './pages/script/create-scripts/create-scripts.component';
import { EditPrimitiveTestComponent } from './pages/primitive-test/edit-primitive-test/edit-primitive-test.component';
import { ListOemComponent } from './pages/oem/list-oem/list-oem.component';
import { CreateOemComponent } from './pages/oem/create-oem/create-oem.component';
import { EditOemComponent } from './pages/oem/edit-oem/edit-oem.component';
import { ListSocComponent } from './pages/soc/list-soc/list-soc.component';
import { CreateSocComponent } from './pages/soc/create-soc/create-soc.component';
import { EditSocComponent } from './pages/soc/edit-soc/edit-soc.component';
import { ListDeviceTypeComponent } from './pages/device-type/list-device-type/list-device-type.component';
import { CreateDeviceTypeComponent } from './pages/device-type/create-device-type/create-device-type.component';
import { EditDeviceTypeComponent } from './pages/device-type/edit-device-type/edit-device-type.component';
import { ExecutionComponent } from './pages/execution/execution.component';
import { CreateScriptGroupComponent } from './pages/script/create-script-group/create-script-group.component';
import { EditScriptsComponent } from './pages/script/edit-scripts/edit-scripts.component';
import { CustomTestsuiteComponent } from './pages/script/custom-testsuite/custom-testsuite.component';
import { EditTestsuiteComponent } from './pages/script/edit-testsuite/edit-testsuite.component';
import { PreferedCategoryComponent } from './pages/prefered-category/prefered-category.component';
import { ListRdkCertificationComponent } from './pages/rdk-certification/list-rdk-certification/list-rdk-certification.component';
import { CreateRdkCertificationComponent } from './pages/rdk-certification/create-rdk-certification/create-rdk-certification.component';
import { EditRdkCertificationComponent } from './pages/rdk-certification/edit-rdk-certification/edit-rdk-certification.component';
import { AnalysisComponent } from './pages/analysis/analysis.component';
import { CreateJiraComponent } from './utility/component/analyze-dialog/create-jira/create-jira.component';
import { AppUpgradeComponent } from './pages/app-upgrade/app-upgrade.component';

/**
 * The main application route configuration for Angular Router.
 * Defines all navigation paths, components, guards, and route metadata.
 *
 * @type {Routes}
 */
export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', title: 'Login', component: LoginComponent },
    { path: 'forgot-password', title: 'Forgot-password', component: ForgotPasswordComponent },
    { path: 'change-password', title: 'Change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
    
    {
        path: '',
        component: MainComponent,
        canActivate: [authGuard],
        children: [
            { path: 'prefered-category', title: 'prefered-category', component: PreferedCategoryComponent, canActivate: [authGuard] },
            { path: 'configure', title: 'Configure', component: ConfigureComponent },
            { path: 'configure/user-management', title: 'UserManagement', component: UserListComponent, data: { role: ['admin'] }, canActivate: [roleGuard] },
            { path: 'configure/create-user', title: 'Create User', component: UserAddComponent },
            { path: 'configure/edit-user', title: 'Edit User', component: UserEditComponent },
            { path: 'configure/create-group', title: 'Group List', component: GroupListComponent, data: { role: ['admin'] }, canActivate: [roleGuard] },
            { path: 'configure/group-add', title: 'Group Add', component: GroupAddComponent },
            { path: 'configure/group-edit/:id', title: 'Group Edit', component: GroupEditComponent },
            { path: 'configure/list-oem', title: 'OEM', component: ListOemComponent},
            { path: 'configure/create-oem', title: 'OEM Add', component: CreateOemComponent },
            { path: 'configure/oem-edit', title: 'OEM Edit', component: EditOemComponent },
            { path: 'configure/list-soc', title: 'Soc', component: ListSocComponent },
            { path: 'configure/create-soc', title: 'Soc Add', component: CreateSocComponent },
            { path: 'configure/edit-soc', title: 'Soc Edit', component: EditSocComponent },
            { path: 'configure/list-devicetype', title: 'DeviceType', component: ListDeviceTypeComponent },
            { path: 'configure/create-devicetype', title: 'DeviceType Add', component: CreateDeviceTypeComponent },
            { path: 'configure/edit-devicetype', title: 'DeviceType Edit', component: EditDeviceTypeComponent },
            { path: 'devices', title: 'Devices', component: DevicesComponent },
            { path: 'devices/device-create', title: 'Device Create', component: DeviceCreateComponent },
            { path: 'devices/device-edit', title: 'Device Edit', component: DeviceEditComponent },
            { path: 'configure/modules-list', title: 'Modules', component: ModulesListComponent },
            {path: 'configure/function-list', title: 'Function', component:FunctionListComponent},
            {path: 'configure/parameter-list', title: 'Parameter', component:ParameterListComponent},
            {path: 'configure/modules-create', title: 'Module Create', component:ModulesCreateComponent},
            {path: 'configure/modules-edit', title: 'Module Edit', component:ModulesEditComponent},
            {path: 'configure/function-create', title: 'Function Create', component:FunctionCreateComponent},
            {path: 'configure/function-edit', title: 'Function Edit', component:FunctionEditComponent},
            {path: 'configure/parmeter-create', title: 'Parmeter Create', component:ParameterCreateComponent},
            {path: 'configure/parameter-edit', title: 'Parmeter Edit', component:ParameterEditComponent},
            {path: 'configure/list-primitivetest',title:'List PrimitiveTest',component:ListPrimitiveTestComponent},
            {path: 'configure/edit-primitivetest',title:'Edit PrimitiveTest',component:EditPrimitiveTestComponent},
            {path:'configure/create-primitivetest', title:'Create PrimitiveTest', component:CreatePrimitiveTestComponent},
            {path:'script', title:'Script', component:ScriptListComponent},
            {path:'script/create-scripts', title:'Cretae Script', component:CreateScriptsComponent},
            {path:'script/edit-scripts', title:'Edit Script', component:EditScriptsComponent},
            {path:'script/create-script-group', title:'Create Script Group', component:CreateScriptGroupComponent},
            {path:'execution', title:'Execution', component: ExecutionComponent,data: { refreshable: true }},
            {path:'script/custom-testsuite', title:'Custom TestSuite', component:CustomTestsuiteComponent},
            {path:'script/edit-testsuite',title:'Edit TestSuite',component:EditTestsuiteComponent},
            {path:'configure/list-rdk-certifications',title:'List RDK Certifications', component:ListRdkCertificationComponent},
            {path:'configure/create-rdk-certifications',title:'Create RDK Certifications', component:CreateRdkCertificationComponent},
            {path:'configure/edit-rdk-certifications', title:'Edit RDK Certifications', component:EditRdkCertificationComponent},
            {path:'analysis', title:'Analysis', component:AnalysisComponent},
            {path:'analysis/create-jira', title:'Create Jira', component:CreateJiraComponent},
            {path:'app-upgrade', title:'App-Upgrade', component:AppUpgradeComponent}
        ]
    }
];
