import { Card, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { MessageForm } from "../../components";
import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";

export default function MessageEdit() {
  const breadcrumbs = [{ content: "Messages", url: "/messages" }];

  /*
     These are mock values.
     Set isLoading to false to preview the page without loading markup.
  */
  const { id } = useParams();
/*
  Fetch the QR code.
  useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
  The backend supplements app data with data queried from the Shopify GraphQL Admin API.
*/
const {
  data: Message,
  isLoading,
  isRefetching,
} = useAppQuery({
  url: `/api/messages/${id}`,
  reactQueryOptions: {
    /* Disable refetching because the QRCodeForm component ignores changes to its props */
    refetchOnReconnect: false,
  },
});

  /* Loading action and markup that uses App Bridge and Polaris components */
  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title="Edit Message"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <Card sectioned title="Title">
              <SkeletonBodyText />
            </Card>
            <Card sectioned title="Type">
                <SkeletonBodyText />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar
        title="Edit Message"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <MessageForm Message={Message} />
    </Page>
  );
}
