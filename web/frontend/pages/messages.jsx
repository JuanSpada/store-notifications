import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
// import { QRCodeIndex } from "../components";
import { MessageIndex } from "../components";
import { useAppQuery } from "../hooks";
import React, { useState, useEffect } from "react";

export default function HomePage() {

  const [messages, setMessages] = useState([]);

  function updateMessage(index, updatedMessage) {  // NO UPDATEA EL MESSAGE ARREGLAR ESTO
    console.log("updating message: ", updatedMessage)
    setMessages((prevState) =>
      prevState.map((message, i) => (i === index ? updatedMessage : message))
    );
  }

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

  
  // Set the messages state whenever messagesData changes
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);
  

  /* Set the Messages to use in the list */
  const messagesMarkup = messages?.length ? (
    <MessageIndex Messages={messages} loading={isRefetching} updateMessage={updateMessage} />
  ) : null;
  

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
  return (
    <Page fullWidth={!!messagesMarkup}>
      <TitleBar
        title="Messages"
        primaryAction={{
          content: "Create message",
          onAction: () => navigate("/messages/new"),
        }}
      />
      <Layout>
        <Layout.Section>
          {loadingMarkup}
          {messagesMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
