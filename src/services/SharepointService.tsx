import responsiveObserve from "antd/lib/_util/responsiveObserve";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export class SharepointService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: "https://qliktechnologies365.sharepoint.com/sites/QlikSharepointPoc/_api/web/Lists/",
      timeout: 1000,
      //   headers: { Accept: "application/json; odata=verbose" },
      //   withCredentials: true,
    });
  }

  //   getAccessToken() {

  // const data = JSON.stringify({
  //   grant_type: "client_credentials",
  //   resource: "00000003-0000-0ff1-ce00-000000000000/qliktechnologies365.sharepoint.com@c21eeb5f-f5a6-44e8-a997-124f2f7a497c",
  //   client_id: "6760f8b7-8437-42ba-9ad3-9c746485e6ce@c21eeb5f-f5a6-44e8-a997-124f2f7a497c",
  //   client_secret: "qG3BbYRlTg0U60klteFQLvN7I/OWg1zFPJx/7ckPp/c=",
  // });
  // const config: AxiosRequestConfig = {
  //   method: "post",
  //   url: "https://accounts.accesscontrol.windows.net/c21eeb5f-f5a6-44e8-a997-124f2f7a497c/tokens/OAuth/2",
  //   headers: {
  //     "Content-Type": "application/x-www-form-urlencoded",
  //   },
  //   data: data,
  // };

  // return axios(config)
  //   .then(function (response) {
  //     console.log(JSON.stringify(response.data));
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
  //   }

  async getList(listName: string, spAccessToken: string): Promise<any> {
    // return this.instance.get(`/GetByTitle('${listName}')/items`);

    const config: AxiosRequestConfig = {
      method: "get",
      url: `https://qliktechnologies365.sharepoint.com/sites/QlikSharepointPoc/_api/web/Lists/GetByTitle('${listName}')/items`,
      headers: {
        Authorization: `Bearer ${spAccessToken}`,
      },
    };

    const response = await axios(config);

    console.log(JSON.stringify(response.data));
    const list = response.data.value.map((row: any) => ({
      id: row.Title,
      comment: row.Comment,
    }));

    return list;
  }

  async saveList(id: string, value: string, listName: string, spAccessToken: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `https://qliktechnologies365.sharepoint.com/sites/QlikSharepointPoc/_api/web/Lists/GetByTitle('${listName}')/items`,
      headers: {
        Authorization: `Bearer ${spAccessToken}`,
        "content-type": "application/json;odata=verbose",
      },
      data: {
        __metadata: {
          type: "SP.Data.MashupCommentsListItem",
        },
        Title: id,
        Comment: value,
        Owner: "Bohua",
        CreatedAt: new Date().toISOString(),
      },
    };

    const response = await axios(config);
    console.log(JSON.stringify(response.data));

    return response;
  }
}
