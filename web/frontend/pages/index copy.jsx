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
import React, { useState, useCallback } from "react";
import { useForm, useField, notEmptyString } from "@shopify/react-form";


export default function HomePage() {

  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

  /* State de los checkbox */
  const [storeCheckbox, setStoreCheckbox] = useState(false);
  const storeCheckboxHandler = useCallback(
    (value) => setStoreCheckbox(value),
    [],
  );

  const [cartCheckbox, setCartCheckbox] = useState(false);
  const cartCheckboxHandler = useCallback(
    (value) => setCartCheckbox(value),
    [],
  );

  const [inventoryCheckbox, setInventoryCheckbox] = useState(false);
  const inventoryCheckboxHandler = useCallback(
    (value) => setInventoryCheckbox(value),
    [],
  );

  /* State de los radio */
  const [positionX, setPositionX] = useState("disabled");
  const handleChangePositionX = useCallback((_checked, newValue) => {
    setPositionX(newValue);
  }, []);

  const [positionY, setPositionY] = useState("disabled");
  const handleChangePositionY = useCallback((_checked, newValue) => {
    setPositionY(newValue);
  }, []);

  /* Style select */
  const [selectedStyle, setSelectedStyle] = useState('today');
  const handleSelectStyleChange = useCallback((value) => setSelectedStyle(value), []);
  const optionsStyle = [
    { label: 'Minimal', value: 'minimal' },
    { label: 'Bold', value: 'bold' },
    { label: 'Playful', value: 'playful' },
    { label: 'Elegant', value: 'elegant' },
  ];

  /* Font select */
  const [selectedFont, setSelectedFont] = useState('today');
  const handleSelectFontChange = useCallback((value) => setSelectedFont(value), []);
  const optionsFont = [
    { label: 'Font #1', value: '1' },
    { label: 'Font #2', value: '2' },
    { label: 'Font #3', value: '3' },
    { label: 'Font #4', value: '4' },
  ];


  // Handle form validation
  const {
    fields: {
      showSettingsStatus,
      showCartStatus,
      showInventoryStatus,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      showSettingsStatus: useField({
        // value: Message?.value || "",
        value: "",
        validates: [notEmptyString("Please enter your message")],
      }),
      showCartStatus: useField({
        // value: Message?.type || "",
        value: "",
        validates: [(value) => {
          if (value === "") {
            return "Please select a message type";
          }
        }]
      }),

    },
    // onSubmit,
  });

  /*
    These are mock values. Setting these values lets you preview the loading markup and the empty state.
  */
  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const {
    data: fetchedMessages,
    isLoading,

    /*
      react-query provides stale-while-revalidate caching.
      By passing isRefetching to Index Tables we can show stale data and a loading state.
      Once the query refetches, IndexTable updates and the loading state is removed.
      This ensures a performant UX.
    */
    isRefetching,
  } = useAppQuery({
    url: "/api/messages"
  });


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
      {fetchedMessages?.length ?
        <Layout>
          <Layout.Section>
            <Card title="When do you want us to show the notifications?">
              <div style={{ padding: "2rem" }}>
                <Checkbox
                  label="Sales: Enable or disable notifications when a customer makes a purchase."
                  checked={storeCheckbox}
                  onChange={storeCheckboxHandler}
                />
                <Checkbox
                  label="Cart: Enable or disable notifications when a customer adds a product to their cart."
                  checked={cartCheckbox}
                  onChange={cartCheckboxHandler}
                />
                <Checkbox
                  label="Inventory: Enable or disable notifications when a product that was previously out of stock becomes available again."
                  checked={inventoryCheckbox}
                  onChange={inventoryCheckboxHandler}
                />
              </div>
            </Card>
            <Card title="Customizations:" distribution="fill">
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
                  <Stack distribution="fill">
                    <div>
                      <div style={{ padding: "1rem 2rem 0" }}>
                        <p>Set the position of the notifications vertically:</p>
                        <div>
                          <RadioButton
                            label="Top"
                            checked={positionY === "disabled"}
                            name="positionY"
                            onChange={() => handleChangePositionY(false, "disabled")}
                          />
                        </div>
                        <div>
                          <RadioButton
                            label="Bottom"
                            name="positionY"
                            checked={positionY === "optional"}
                            onChange={() => handleChangePositionY(false, "optional")}
                          />
                        </div>
                      </div>
                      <div style={{ padding: "1rem 2rem 0" }}>
                        <p>Set the position of the notifications horizontalally:</p>
                        <div>
                          <RadioButton
                            label="Right"
                            checked={positionX === "disabled"}
                            name="positionX"
                            onChange={() => handleChangePositionX(false, "disabled")}
                          />
                        </div>
                        <div>
                          <RadioButton
                            checked={positionX === "optional"}
                            label="Left"
                            name="positionX"
                            onChange={() => handleChangePositionX(false, "optional")}
                          />
                        </div>
                      </div>
                      <div style={{ padding: "1rem 2rem" }}>
                        <Select
                          label="Notification Style:"
                          options={optionsStyle}
                          onChange={handleSelectStyleChange}
                          value={selectedStyle}
                        />
                      </div>
                    </div>
                    <div style={{ padding: "0.5rem" }}>
                      <div>
                        <TextField
                          prefix="#"
                          label="Background Color:"
                          value={"value"}
                          // onChange={handleChange}
                          autoComplete="off"
                        />
                      </div>
                      <div style={{ marginTop: "0.5rem" }}>
                        <TextField
                          prefix="#"
                          label="Text Color:"
                          // value={value}
                          // onChange={handleChange}
                          autoComplete="off"
                        />
                      </div>
                      <div style={{ marginTop: "0.5rem" }}>
                        <Select
                          label="Font:"
                          options={optionsFont}
                          onChange={handleSelectFontChange}
                          value={selectedFont}
                        />
                      </div>
                    </div>
                  </Stack>
                </FormLayout>
              </Form>
            </Card>
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
