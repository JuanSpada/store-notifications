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
} from "@shopify/polaris";

import {
  ContextualSaveBar,
} from "@shopify/app-bridge-react";

// import { QRCodeIndex } from "../components";
import { MessageIndex } from "../components";
import { useAppQuery } from "../hooks";
import React, { useState, useCallback, useEffect } from "react";
import { useForm, useField, notEmptyString } from "@shopify/react-form";


export default function HomePage() {

  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

    /*
    These are mock values. Setting these values lets you preview the loading markup and the empty state.
  */
  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const {
    data: fetchedSettings,
    isLoading,

    /*
      react-query provides stale-while-revalidate caching.
      By passing isRefetching to Index Tables we can show stale data and a loading state.
      Once the query refetches, IndexTable updates and the loading state is removed.
      This ensures a performant UX.
    */
    isRefetching,
  } = useAppQuery({
    url: "/api/settings"
  });

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
      displaySalesStatus: useField({
        value: fetchedSettings?.displaySalesStatus || "",
      }),
      displayCartStatus: useField({
        value: fetchedSettings?.displayCartStatus || "",
      }),
      displayInventoryStatus: useField({
        value: fetchedSettings?.displayInventoryStatus || "",
      }),
      positionX: useField({
        value: fetchedSettings?.positionX || "",
      }),
      positionY: useField({
        value: fetchedSettings?.positionY || "",
      }),
      style: useField({
        value: fetchedSettings?.style || "",
        validates: [(value) => {
          if(value === ""){
            return "Please select a message type";
          }
        }]
      }),
      backgroundColor: useField({
        value: fetchedSettings?.backgroundColor || "",
      }),
      textColor: useField({
        value: fetchedSettings?.textColor || "",
      }),
      font: useField({
        value: fetchedSettings?.font || "",
        validates: [(value) => {
          if(value === ""){
            return "Please select a message type";
          }
        }]
      }),
    },
    // onSubmit,
  });

  /* State de los checkbox */
  const [salesCheckbox, setSalesCheckbox] = useState(false);
  const salesCheckboxHandler = useCallback(
    (value) => {
      setSalesCheckbox(value);
      displaySalesStatus.onChange(value);
    },
    [],
  );

  const [cartCheckbox, setCartCheckbox] = useState(false);
  const cartCheckboxHandler = useCallback(
    (value) => {
      setCartCheckbox(value);
      displayCartStatus.onChange(value);
    },
    [],
  );

  const [inventoryCheckbox, setInventoryCheckbox] = useState(false);
  const inventoryCheckboxHandler = useCallback(
    (value) => {
      setInventoryCheckbox(value);
      displayInventoryStatus.onChange(value);
    },
    [],
  );

  /* State de los radio */
  const [positionXValue, setPositionX] = useState("left");
  const handleChangePositionX = useCallback((_checked, newValue) => {
    setPositionX(newValue);
    positionX.onChange(newValue);
  }, []);

  const [positionYValue, setPositionY] = useState("bottom");
  const handleChangePositionY = useCallback((_checked, newValue) => {
    setPositionY(newValue);
    positionY.onChange(newValue);
  }, []);

  /* Style select */
  const [selectedStyle, setSelectedStyle] = useState('today');
  const handleSelectStyleChange = (value) => {
    setSelectedStyle(value);
    style.onChange(value);
  };
  const optionsStyle = [
    {label: 'Select notification style', value: ''},
    { label: 'Minimal', value: 'minimal' },
    { label: 'Bold', value: 'bold' },
    { label: 'Playful', value: 'playful' },
    { label: 'Elegant', value: 'elegant' },
  ];

  /* Background color field */
  const [backgroundColorValue, setBackgroundColor] = useState();
  const handleBackgroundColorChange = useCallback((newValue) => {
    setBackgroundColor(newValue);
    backgroundColor.onChange(newValue);
  }, []);

  /* Text color field */
  const [textColorValue, setTextColor] = useState();
  const handleTextColorChange = useCallback((newValue) => {
    setTextColor(newValue);
    textColor.onChange(newValue);
  }, []);

  /* Font select */
  const [selectedFont, setSelectedFont] = useState('today');
  const handleSelectFontChange = useCallback((value) => {
    setSelectedFont(value);
    font.onChange(value);
  }, []);
  const optionsFont = [
    {label: 'Select notification font', value: ''},
    {label: 'Use same as my store', value: 'default'},
    { label: 'Font #1', value: '1' },
    { label: 'Font #2', value: '2' },
    { label: 'Font #3', value: '3' },
    { label: 'Font #4', value: '4' },
  ];

  /* useEffect para asignar los valores al formulario */
  useEffect(() => {
    if (fetchedSettings) {
      setSalesCheckbox(fetchedSettings.displaySalesStatus);
      setCartCheckbox(fetchedSettings.displayCartStatus);
      setInventoryCheckbox(fetchedSettings.displayInventoryStatus);
      setPositionY(fetchedSettings.positionY)
      setPositionX(fetchedSettings.positionX)
      setSelectedStyle(fetchedSettings.style)
      setSelectedFont(fetchedSettings.font)
      setBackgroundColor(fetchedSettings.backgroundColor)
      setTextColor(fetchedSettings.textColor)
    }
  }, [fetchedSettings]);
  
  

  /* loadingMarkup uses the loading component from AppBridge and components from Polaris  */
  const loadingMarkup = isLoading ? (
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
      {fetchedSettings?
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
                        label="Sales: Enable or disable notifications when a customer makes a purchase."
                        checked={salesCheckbox}
                        onChange={salesCheckboxHandler}
                      />
                    </div>
                    <div>
                      <Checkbox
                        label="Cart: Enable or disable notifications when a customer adds a product to their cart."
                        checked={cartCheckbox}
                        onChange={cartCheckboxHandler}
                      />
                    </div>
                    <div>
                      <Checkbox
                        label="Inventory: Enable or disable notifications when a product that was previously out of stock becomes available again."
                        checked={inventoryCheckbox}
                        onChange={inventoryCheckboxHandler}
                      />
                    </div>
                    <div style={{marginTop: "1rem"}}>
                      <p>Edit notifications messages</p> 
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
                            <RadioButton
                              label="Top"
                              checked={positionYValue === "top"}
                              name="positionY"
                              onChange={() => handleChangePositionY(false, "top")}
                              value={"top"}
                            />
                          </div>
                          <div>
                            <RadioButton
                              label="Bottom"
                              name="positionY"
                              checked={positionYValue === "bottom"}
                              onChange={() => handleChangePositionY(false, "bottom")}
                              value={"bottom"}
                            />
                          </div>
                        </div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <p>Set the position of the notifications horizontalally:</p>
                          <div>
                            <RadioButton
                              label="Right"
                              checked={positionXValue === "right"}
                              name="positionX"
                              onChange={() => handleChangePositionX(false, "right")}
                              value="right"
                            />
                          </div>
                          <div>
                            <RadioButton
                              checked={positionXValue === "left"}
                              label="Left"
                              name="positionX"
                              onChange={() => handleChangePositionX(false, "left")}
                              value="left"
                            />
                          </div>
                        </div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <Select
                            label="Notification Style:"
                            options={optionsStyle}
                            onChange={handleSelectStyleChange}
                            value={selectedStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <div style={{ padding: "0 2rem 0" }}>
                          <TextField
                            prefix="#"
                            label="Background Color:"
                            value={backgroundColorValue}
                            onChange={handleBackgroundColorChange}
                            autoComplete="off"
                          />
                        </div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <TextField
                            prefix="#"
                            label="Text Color:"
                            value={textColorValue}
                            onChange={handleTextColorChange}
                            autoComplete="off"
                          />
                        </div>
                        <div style={{ padding: "1rem 2rem 0" }}>
                          <Select
                            label="Font:"
                            options={optionsFont}
                            onChange={handleSelectFontChange}
                            value={selectedFont}
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
              <p>ghola</p>
            </Card>
          </Layout.Section>
        </Layout>
        : null}
    </Page>
  );
}
