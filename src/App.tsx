import React, { Component } from "react";
import { Layout, Row, Col, Card, Typography, Button, Modal } from "antd";
import { ColumnsType } from "antd/lib/table";
import { GetAppConfig, Layout as QlikLayout } from "qlik";
import { QlikService } from "./services/QlikService";
import "./App.css";
import { ShareTable } from "./components/ShareTable";
import { SharepointService } from "./services/SharepointService";
import { deepCopy } from "./utils/Helpers";

const { Header, Footer, Content } = Layout;
const { Title, Paragraph } = Typography;

const rowStyle = { padding: "8px 16px" };

type AppState = {
  columns: ColumnsType<any>;
  data: any[];
  login: boolean;
  spLoginVisible: boolean;
  spAccessToken: string;
};

class App extends Component<{}, AppState> {
  private qlikService: QlikService;
  private sharepointService: SharepointService;
  private config: GetAppConfig;

  constructor(props: any) {
    super(props);

    this.state = {
      columns: [],
      data: [],
      login: true,
      spLoginVisible: false,
      spAccessToken: "",
    };

    this.config = {
      host: "localhost",
      port: "4848",
      prefix: "/",
      isSecure: false,
    };

    this.qlikService = new QlikService();
    this.sharepointService = new SharepointService();
  }

  componentDidMount() {
    this.qlikService.connect(this.config).then(() => {
      this.qlikService.openApp("Happiness.qvf");
      this.qlikService.getObject("obj1", "peKyVb");
      this.qlikService.getObject("obj2", "RwLPsv");
      this.qlikService.getObject("CurrentSelections", "CurrentSelections");

      this.qlikService.getTable("FaPpmj", (layout: QlikLayout) => {
        const dimensions: ColumnsType = layout.qHyperCube.qDimensionInfo.map((dimension, index) => ({ title: dimension.qFallbackTitle, dataIndex: `dim${index}` }));
        const measures: ColumnsType = layout.qHyperCube.qMeasureInfo.map((measure, index) => ({ title: measure.qFallbackTitle, dataIndex: `msr${index}` }));
        const tableData = layout.qHyperCube.qDataPages[0].qMatrix.map((row, rowInx) => {
          const dataRow: any = {
            _id: rowInx,
          };

          row.forEach((cell, index) => {
            if (index < dimensions.length) {
              dataRow[`dim${index}`] = cell.qText;
            } else {
              dataRow[`msr${index - dimensions.length}`] = cell.qText;
            }
          });

          dataRow["SP_Comment"] = "";

          return dataRow;
        });

        this.setState({
          columns: [
            ...dimensions,
            ...measures,
            {
              title: "Comment",
              dataIndex: "SP_Comment",
              render: (text, record) => (
                <Paragraph
                  style={{ margin: 0 }}
                  editable={{
                    onChange: async (value) => {
                      console.log("record", record);

                      const id = record["dim2"];
                      await this.sharepointService.saveList(id, value, "MashupComments", this.state.spAccessToken);

                      this.loadTable();
                    },
                  }}
                >
                  {text}
                </Paragraph>
              ),
            },
          ],
          data: tableData,
        });

        this.loadTable();
      });

      this.qlikService.getVariableContent("vAccessToken").then(
        (value: string) => {
          // console.log(value);
          this.setState({ spAccessToken: value });
          this.loadTable();
        },
        (error) => {
          console.log(error);
        }
      );
    });

    // this.sharepointService.getList("MashupComments");
  }

  loadTable() {
    this.sharepointService.getList("MashupComments", this.state.spAccessToken).then((list: any) => {
      const newData = deepCopy(this.state.data);

      list.forEach((listRow: any) => {
        newData.forEach((dataRow: any) => {
          if (dataRow["dim2"] === listRow["id"]) {
            dataRow["SP_Comment"] = listRow["comment"];
          }
        });
      });

      this.setState({ data: newData, login: true });
    });
  }

  render() {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Header>
          <Title level={4} className="title">
            Qlik Sharepoint PoC
          </Title>
        </Header>
        <div id="CurrentSelections" className="selection-bar"></div>

        <Content>
          <Row style={rowStyle} gutter={16}>
            <Col span={12}>
              <Card bordered={false}>
                <div id="obj1" className="qv-object"></div>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false}>
                <div id="obj2" className="qv-object"></div>
              </Card>
            </Col>
          </Row>
          <Row style={rowStyle} gutter={16}>
            <Col span={24}>
              <Card bordered={false}>
                {this.state.login ? <ShareTable columns={this.state.columns} dataSource={this.state.data}></ShareTable> : <Button onClick={() => {}}>Login to Sharepoint</Button>}
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  // let data: any = [];

  // const [data, setData] = useState<any>();

  // setData({
  //   dim0: "APEC",
  //   dim1: "Shanghai",
  //   dim3: "China",
  // });
}

export default App;
