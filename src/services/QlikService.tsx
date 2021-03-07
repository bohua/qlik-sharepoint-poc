import { GetAppConfig, Error, Global, App, HyperCubeDef } from "Qlik";

export class QlikService {
  private qlik: Global | undefined;
  private config!: GetAppConfig;
  private app!: App;

  connect(config: GetAppConfig): Promise<Global> {
    if (this.qlik) {
      return Promise.resolve(this.qlik);
    }

    this.config = config;
    const requireJs: any = window.require;

    requireJs.config({
      baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources",
    });

    return new Promise((resolve, reject) => {
      requireJs(
        ["js/qlik"],
        (qlik: Global) => {
          this.qlik = qlik;

          qlik.setOnError(
            (error: Error) => console.log(error),
            (warning: string) => console.log(warning)
          );

          resolve(qlik);
        },
        (error: any) => {
          console.log(error);

          reject(error);
        }
      );
    });
  }

  openApp(appId: string): App {
    this.app = this.qlik.openApp(appId, this.config);
    return this.app;
  }

  getObject(elementId: string, objectId: string): Promise<any> {
    return this.app.getObject(elementId, objectId);
  }

  getTable(objectId: string, cb: Function): Promise<any> {
    return this.app.getObjectProperties(objectId).then((model) => {
      const def: HyperCubeDef = model.properties.qHyperCubeDef;

      def.qInitialDataFetch = [
        {
          qLeft: 0,
          qTop: 0,
          qWidth: (def.qDimensions ? def.qDimensions.length : 0) + (def.qMeasures ? def.qMeasures.length : 0),
          qHeight: 1000,
        },
      ];

      return this.app.createCube(def, (hypercube) => {
        cb(hypercube);
      });
    });
  }

  getVariableContent(variable: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.app.variable
        .getContent(variable, (value) => {
          resolve(value.qContent.qString);
        })
        .catch((error) => reject(error));
    });
  }
}
