import { setWorldConstructor, World } from '@cucumber/cucumber';
import { messages } from '@cucumber/messages';
import { BrowserContext, Browser, Page } from 'playwright';
import { CustomWorldOptions } from './custom-world-options';

export class CustomWorld extends World {
  context?: BrowserContext;
  feature?: messages.IPickle;
  page?: Page;
  browser?: Browser;
  constructor(options: CustomWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
