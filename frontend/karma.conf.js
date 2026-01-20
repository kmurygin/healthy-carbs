import {createRequire} from 'module';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-junit-reporter')
    ],
    client: {
      jasmine: {},
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/healthy-carbs'),
      subdir: '.',
      reporters: [
        {type: 'html'},
        {type: 'text-summary'}
      ]
    },
    reporters: ['progress', 'kjhtml', 'junit'],
    junitReporter: {
      outputDir: require('path').join(__dirname, 'test-results'),
      outputFile: 'test-results.xml',
      useBrowserName: false
    },
    browsers: ['Chrome', 'ChromeHeadless'],
    restartOnFileChange: true
  });
};
