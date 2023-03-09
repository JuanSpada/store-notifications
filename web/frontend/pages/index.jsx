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

  const handleBackgroundColorChange = useCallback((newValue) => setValue(newValue), []);


  const optionsStyle = [
    { label: 'Select notification style', value: '' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'Bold', value: 'bold' },
    { label: 'Playful', value: 'playful' },
    { label: 'Elegant', value: 'elegant' },
  ];
  const optionsFont = [
    { label: 'Select notification font', value: "" },
    { label: 'Use same as my store', value: "inherit" },
    { label: 'Noto Sans', value: "'Noto Sans', sans-serif" },
    { label: 'Noto Sans Mono', value: "'Noto Sans Mono', monospace" },
    { label: 'Noto Sans Symbols', value: "'Noto Sans Symbols', sans-serif" },
    { label: 'Noto Serif Display', value: "'Noto Serif Display', serif" },
    { label: 'Roboto', value: "'Roboto', sans-serif" },
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
                    {/* <div>
                      <Checkbox
                        {...displayInventoryStatus}
                        label="Inventory: Enable or disable notifications when a product that was previously out of stock becomes available again."
                        checked={displayInventoryStatus.value}
                        // onChange={inventoryCheckboxHandler}
                      />
                    </div> */}
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
                            // onChange={handleSelectStyleChange}
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
                            // onChange={handleSelectFontChange}
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
              {Settings && filteredMessages && filteredMessages.length > 0 ?
                <Notification settings={Settings} messages={filteredMessages}></Notification>
                : <div>No messages to show</div>}
            </Card>
          </Layout.Section>
        </Layout>
        : null}
    </Page>
  );
}
