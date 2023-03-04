import { useState, useCallback } from "react";
import {
  Banner,
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  Select,
  ChoiceList,
  Thumbnail,
  Icon,
  Stack,
  TextStyle,
  Layout,
  EmptyState,
} from "@shopify/polaris";
import {
  ContextualSaveBar,
  ResourcePicker,
  useAppBridge,
  useNavigate,
} from "@shopify/app-bridge-react";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField, notEmptyString } from "@shopify/react-form";

/*
  The discount codes available in the store.

  This variable will only have a value after retrieving discount codes from the API.
*/

export function MessageForm({ Message: InitialMessage }) {
  const [Message, setMessage] = useState(InitialMessage);
  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();

  /* Message type's select options */
  const [selected, setSelected] = useState(Message?.type || 'Select message type');
  /*
    This is a placeholder function that is triggered when the user hits the "Save" button.

    It will be replaced by a different function when the frontend is connected to the backend.
  */
  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body;
        const MessageId = Message?.id;
        /* construct the appropriate URL to send the API request to based on whether the QR code is new or being updated */
        const url = MessageId ? `/api/messages/${MessageId}` : "/api/messages";
        /* a condition to select the appropriate HTTP method: PATCH to update a QR code or POST to create a new QR code */
        const method = MessageId ? "PATCH" : "POST";
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(url, { 
          method,
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          makeClean();
          const Message = await response.json();
          /* if this is a new QR code, then save the QR code and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
          if (!MessageId) {
            navigate(`/messages/${Message.id}`);
            /* if this is a QR code update, update the QR code state in this component */
          } else {
            setMessage(Message);
          }
        }
      })();
      return { status: "success" };
    },
    [Message, setMessage]
  );
  
  /*
    Sets up the form state with the useForm hook.

    Accepts a "fields" object that sets up each individual field with a default value and validation rules.

    Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.

    Returns helpers to manage form state, as well as component state that is based on form state.
  */
  const {
    fields: {
      value,
      type,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      value: useField({
        value: Message?.value || "",
        validates: [notEmptyString("Please enter your message")],
      }),
      type: useField({
        value: Message?.type || "",
        validates: [(value) => {
          if(value === ""){
            return "Please select a message type";
          }
        }]
      }),
  
    },
    onSubmit,
  });

  const handleSelectChange = (selected) => {
    type.onChange(selected);
    setSelected(selected);
  };
  const options = [
    {label: 'Select message type', value: ''},
    {label: 'Sales', value: 'sales'},
    {label: 'Cart', value: 'cart'},
  ];

  /*
    This is a placeholder function that is triggered when the user hits the "Delete" button.

    It will be replaced by a different function when the frontend is connected to the backend.
  */
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMessage = useCallback(async () => {
    reset();
    /* The isDeleting state disables the download button and the delete QR code button to show the merchant that an action is in progress */
    setIsDeleting(true);
    const response = await fetch(`/api/messages/${Message.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate(`/messages`);
    }
  }, [Message]);
  
  
  /* The form layout, created using Polaris and App Bridge components. */
  return (
    <Stack vertical>
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
              <Card sectioned title="Message">
                <TextField
                  {...value}
                  label="Message"
                  labelHidden
                  name="value"
                />
                <div>
                  <h5 style={{marginTop: "1rem", fontWeight: "bold"}}>Dynamic Variables</h5>
                  <p>Make your notifications more personal by including dynamic variables that will be replaced with the actual product or customer information when the notification is displayed.</p>
                  <p>For example, if you include the dynamic variable <strong>[product.name]</strong>, it will be replaced with the name of the product that triggered the notification. Similarly, if you include the dynamic variable <strong>[customer.name]</strong>, it will be replaced with the name of the customer who triggered the notification.</p>
                  <br />
                  <p style={{color: "gray"}}>Note: we are only displaying customers first name, we never show full names or other sensitive information.</p>
                </div>
              </Card>
              <Card sectioned title="Type">
                <Select
                  {...type}
                  helpText="Select your message type"
                  options={options}
                  onChange={handleSelectChange}
                  value={selected}
                  label="Type"
                  name="type"
                  labelHidden={true}
                />
                <div>
                  <h5 style={{marginTop: "1rem", fontWeight: "bold"}}>At the moment we currently support only 2 types:</h5>
                  <ul>
                    <li>Sales: notifications when someone purchased a product</li>
                    <li>Cart: notifications when someone added a product to the cart</li>
                  </ul>
                </div>
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section secondary>
          <Card>
            <Stack>
                
            </Stack>

          </Card>
        </Layout.Section>
        <Layout.Section>
          {Message?.id && (
            <Button
              outline
              destructive
              onClick={deleteMessage}
              loading={isDeleting}
            >
              Delete Message
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Stack>
  );
}