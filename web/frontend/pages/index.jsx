// FALTA HACER QUE TE MUESTRE BIEN POR DEFUALT LAS SETTINGS DE LA DB Y NO APAREZCA EL BAR POR Q DE LA MANERA Q LO HICE CADA VEZ QUE CARGAS LA PAGINA APARECE EL BAR COMO SI FUESE QUE EDITASTE ALGO

// cuiando desactivas todos los settings de q mensaje mostrar se cagan los position tambien, por que parece que si vienen vacios quedan "" en ves de false
// Y TODAVIA NO ANDAN LOS FILTROS OSEA SI APAGAS SIN RECARGAR LA PAGINA EN PREVIEW SIGUEN APARECIENDO
import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  Card,
  RadioButton,
  Layout,
  Checkbox,
  Page,
  SkeletonBodyText,
  Select,
  Stack,
  TextField,
  FormLayout,
  Form,
  ChoiceList,
  Link
} from "@shopify/polaris";

import {
  ContextualSaveBar,
} from "@shopify/app-bridge-react";

// import { QRCodeIndex } from "../components";
import React, { useState, useCallback, useEffect } from "react";
import { useForm, useField, notEmptyString, useChoiceField } from "@shopify/react-form";
import { Notification } from "../components"
/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

import "./notificationCss.css";

export default function HomePage() {

  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  const [Settings, setSettings] = useState();


  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body;
        // return { status: "success" };
        const url = "/api/settings";
        const method = "PATCH";
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(url, {
          method,
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          makeClean();
          const Settings = await response.json();
          setSettings(Settings)
        }
      })();
      return { status: "success" };
    },
    [Settings, setSettings]
  );


  /*
  These are mock values. Setting these values lets you preview the loading markup and the empty state.
*/
  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const {
    data: fetchedSettings,
    isLoading: isSettingsLoading,
    isRefetching: isSettingsRefetching, // que es esto?
  } = useAppQuery({
    url: "/api/settings",
  });

  if (fetchedSettings && !Settings) {
    setSettings(fetchedSettings);
  }

  const {
    data: fetchedMessages,
    isLoading: isMessagesLoading,
    isRefetching: isMessagesRefetching,
  } = useAppQuery({
    url: "/api/messages",
  });


  const [filteredMessages, setFilteredMessages] = useState();
  const filterMessages = () => {
    const messageTypes = {
      sales: Settings.displaySalesStatus === 1 || Settings.displaySalesStatus ? "sales" : null,
      cart: Settings.displayCartStatus === 1 || Settings.displayCartStatus ? "cart" : null,
      inventory: Settings.displayInventoryStatus === 1 || Settings.displayInventoryStatus ? "inventory" : null
    };
    
    setFilteredMessages(
      fetchedMessages?.filter((message) => {
        return message.status === 1 && Object.keys(messageTypes).some(type => {
          return message.type === type && messageTypes[type];
        });
      })
    );
  };

  // Handle form validation
  const {
    fields: {
      displaySalesStatus,
      displayCartStatus,
      displayInventoryStatus,
      positionX,
      positionY,
      style,
      backgroundColor,
      textColor,
      font
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      displaySalesStatus: useField(Settings?.displaySalesStatus === 1 ? true : false ),
      displayCartStatus: useField(Settings?.displayCartStatus === 1 ? true : false ),
      displayInventoryStatus: useField(Settings?.displayInventoryStatus === 1 ? true : false ),
      positionX: useField(
       [Settings?.positionX] || ['left'],
      ),
      positionY: useField(
        [Settings?.positionY] || ['bottom'],
      ),
      style: useField({
        value: Settings?.style || "",
        validates: [(value) => {
          if (value === "") {
            return "Please select a notification style";
          }
        }]
      }),
      backgroundColor: useField({
        value: Settings?.backgroundColor || "",
        validates: [notEmptyString("Please select a background color")],
      }),
      textColor: useField({
        value: Settings?.textColor || "",
        validates: [notEmptyString("Please select a text color")],
      }),
      font: useField({
        value: Settings?.font || "",
        validates: [(value) => {
          if (value === "") {
            return "Please select a notification font";
          }
        }]
      }),
    },
    onSubmit,
  });

  /* State de los messages */



  /* State de los checkbox */
  // const [salesCheckbox, setSalesCheckbox] = useState();
  // const salesCheckboxHandler = useCallback(
  //   (value) => {
  //     setSalesCheckbox(value);
  //     displaySalesStatus.onChange(value);
  //   },
  //   [],
  // );

  // const [cartCheckbox, setCartCheckbox] = useState();
  // const cartCheckboxHandler = useCallback(
  //   (value) => {
  //     setCartCheckbox(value);
  //     displayCartStatus.onChange(value);
  //   },
  //   [],
  // );

  // const [inventoryCheckbox, setInventoryCheckbox] = useState();
  // const inventoryCheckboxHandler = useCallback(
  //   (value) => {
  //     setInventoryCheckbox(value);
  //     displayInventoryStatus.onChange(value);
  //   },
  //   [],
  // );

  /* State de los radio */
  // const [positionXValue, setPositionX] = useState("");
  // const handleChangePositionX = useCallback((value) => {
  //   setPositionX(value);
  //   positionX.onChange(value);
  // }, []);
  
  const [selectedPositionX, setSelectedPositionX] = useState("");
  const handleChangePositionX = useCallback((value) => {
    setSelectedPositionX(value);
    positionX.onChange(value);
  }, []);


  // const [positionYValue, setPositionY] = useState("bottom");
  // const handleChangePositionY = useCallback((value) => {
  //   setPositionY(value);
  //   positionY.onChange(value);
  // }, []);

  /* Style select */
  const [selectedStyle, setSelectedStyle] = useState('today');
  const handleSelectStyleChange = (value) => {
    setSelectedStyle(value);
    style.onChange(value);
  };
  const optionsStyle = [
    { label: 'Select notification style', value: '' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'Bold', value: 'bold' },
    { label: 'Playful', value: 'playful' },
    { label: 'Elegant', value: 'elegant' },
  ];

  /* Background color field */
  // const [backgroundColorValue, setBackgroundColor] = useState();
  // const handleBackgroundColorChange = useCallback((newValue) => {
  //   setBackgroundColor(newValue);
  //   backgroundColor.onChange(newValue);
  // }, []);

  /* Text color field */
  // const [textColorValue, setTextColor] = useState();
  // const handleTextColorChange = useCallback((newValue) => {
  //   setTextColor(newValue);
  //   textColor.onChange(newValue);
  // }, []);

  /* Font select */
  const [selectedFont, setSelectedFont] = useState('today');
  const handleSelectFontChange = useCallback((value) => {
    setSelectedFont(value);
    font.onChange(value);
  }, []);
  const optionsFont = [
    { label: 'Select notification font', value: '' },
    { label: 'Use same as my store', value: 'default' },
    { label: 'Font #1', value: '1' },
    { label: 'Font #2', value: '2' },
    { label: 'Font #3', value: '3' },
    { label: 'Font #4', value: '4' },
  ];

  
  
  /* useEffect para asignar los valores al formulario y los mensajes al preview */
  useEffect(() => {
    if (fetchedSettings && fetchedMessages) {
      filterMessages()
    }
  }, [fetchedSettings, fetchedMessages, Settings]);

  /* useEffect para filtrar los mensajes y desp cada vez que se llama algun checkbox lo volvemos a llamar */
  useEffect(() => {
    if (fetchedSettings && fetchedMessages) {
      filterMessages();
    }
  }, [fetchedSettings, fetchedMessages]);

  /* loadingMarkup uses the loading component from AppBridge and components from Polaris  */
  const loadingMarkup = isSettingsLoading && isMessagesLoading ? (
    <Card sectioned>
      <Loading />
      <SkeletonBodyText />
    </Card>
  ) : null;

  /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include the empty state contents set above.
  */

  // NO PUEDO HACER QUE APAREZCA ALA IZQUIERDA Y FUNCIONE DISTRIBUTION FIELD EN STACK QUE ESLO QUE HACE RESPONSIVE EN SHOPIFY ADMIN, ESTO SERIA PARA MOSTRAR EL PREVIEW A LA DERECHA. ESTA PARTE ES COMPLIQUETIXD
  return (
    <Page fullWidth={true}>
      <TitleBar
        title="Account setup"
      // primaryAction={{
      //   content: "Create message",
      //   onAction: () => navigate("/messages/new"),
      // }}
      />
      {loadingMarkup}
      {fetchedSettings && fetchedMessages ?
        <Layout>
          <Layout.Section>
            <Form>
              <ContextualSaveBar
                saveAction={{
                  label: "Save",
                  onAction: submit,
                  loading: submitting,
                  disabled: submitting,
                }}
                discardAction={{
                  label: "Discard",
                  onAction: reset,
                  loading: submitting,
                  disabled: submitting,
                }}
                visible={dirty}
                fullWidth
              />
              <FormLayout>
                <Card title="When do you want us to show the notifications?">
                  <div style={{ padding: "2rem" }}>
                    <div>
                      <Checkbox
                        {...displaySalesStatus}
                        label="Sales: Enable or disable notifications when a customer makes a purchase."
                        checked={displaySalesStatus.value}
                        // onChange={salesCheckboxHandler}
                      />
                    </div>
                    <div>
                      <Checkbox
                        {...displayCartStatus}
                        label="Cart: Enable or disable notifications when a customer adds a product to their cart."
                        checked={displayCartStatus.value}
                        // onChange={cartCheckboxHandler}
                      />
                    </div>
                    <div>
                      <Checkbox
                        {...displayInventoryStatus}
                        label="Inventory: Enable or disable notifications when a product that was previously out of stock becomes available again."
                        checked={displayInventoryStatus.value}
                        // onChange={inventoryCheckboxHandler}
                      />
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                      <Link onClick={() => navigate("/messages")}>Edit notifications messages</Link>
                    </div>
                  </div>
                </Card>
                <Card title="Customizations:" distribution="fill">
                  <div style={{ paddingBottom: "1rem" }}>
                    <Stack distribution="fill">
                      <div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <p>Set the position of the notifications vertically:</p>
                          <div>
                            <ChoiceList
                              {...positionX}
                              name="positionX"
                              choices={[
                                {label: 'Right', value: 'right'},
                                {label: 'Left', value: 'left'},
                              ]}
                              selected={positionX.value}
                            />
                          </div>
                        </div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <p>Set the position of the notifications horizontalally:</p>
                          <div>
                          <ChoiceList
                              {...positionY}
                              name="positionY"
                              choices={[
                                {label: 'Top', value: 'top'},
                                {label: 'Bottom', value: 'bottom'},
                              ]}
                              selected={positionY.value}
                            />
                          </div>
                        </div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <Select
                            {...style}
                            label="Notification Style:"
                            options={optionsStyle}
                            onChange={handleSelectStyleChange}
                            // value={selectedStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <div style={{ padding: "0 2rem 0" }}>
                          <TextField
                            {...backgroundColor}
                            prefix="#"
                            label="Background Color:"
                            // value={backgroundColorValue}
                            // onChange={handleBackgroundColorChange}
                            autoComplete="off"
                          />
                        </div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <TextField
                            {...textColor}
                            prefix="#"
                            label="Text Color:"
                            // value={textColorValue}
                            // onChange={handleTextColorChange}
                            autoComplete="off"
                          />
                        </div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <Select
                            {...font}
                            label="Font:"
                            options={optionsFont}
                            onChange={handleSelectFontChange}
                            // value={selectedFont}
                          />
                        </div>
                      </div>
                    </Stack>
                  </div>
                </Card>

              </FormLayout>
            </Form>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned title="Preview">
              {filteredMessages && filteredMessages.length > 0 ?
                <Notification messages={filteredMessages}></Notification>
                : <div>No messages to show</div>}
            </Card>
          </Layout.Section>
        </Layout>
        : null}
    </Page>
  );
}
