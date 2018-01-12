/*
* Copyright 2018 PoC-Consortium
*/

import { platformNativeScript } from "nativescript-angular/platform-static";

import { AppModuleNgFactory } from "./app.module.ngfactory";

platformNativeScript().bootstrapModuleFactory(AppModuleNgFactory);
