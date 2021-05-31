import { chromium, firefox, webkit } from 'playwright';
import { browserOptions } from './browser-options';
import { CustomWorld } from '../../world/custom-world';
import { ITestCaseHookParameter } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { Browser } from 'playwright';
import { Status } from '@cucumber/cucumber';

declare global {
  namespace NodeJS {
    interface Global {
      browser: Browser;
    }
  }
}

export function createBrowser(): (this: CustomWorld) => Promise<void> {
  return async function () {
    switch (process.env.BROWSER) {
      case 'firefox':
        global.browser = await firefox.launch(browserOptions);
        break;
      case 'webkit':
        global.browser = await webkit.launch(browserOptions);
        break;
      case 'chrome':
        global.browser = await chromium.launch({
          ...browserOptions,
          channel: 'chrome',
        });
        break;
      default:
        global.browser = await chromium.launch(browserOptions);
    }
  };
}

export function closeBrowser(): () => Promise<void> {
  return async function () {
    await global.browser.close();
  };
}

export function createContext(): (this: CustomWorld, { pickle }: ITestCaseHookParameter) => Promise<void> {
  return async function (this: CustomWorld, { pickle }: ITestCaseHookParameter) {
    this.context = await global.browser.newContext({
      acceptDownloads: true,
    });

    this.page = await this.context?.newPage();
    this.feature = pickle;
  };
}

export function closeContext(): (this: CustomWorld, { pickle }: ITestCaseHookParameter) => Promise<void> {
  return async function (this: CustomWorld, { result }: ITestCaseHookParameter) {
    if (result) {
      await this.attach(`Status: ${result?.status}. Duration:${result.duration?.seconds}}s`);
      if (result.status !== Status.PASSED) {
        const image = await this.page?.screenshot();
        image && (await this.attach(image, 'image/png'));
      }
    }

    await this.page?.close();
    await this.context?.close();
  };
}
