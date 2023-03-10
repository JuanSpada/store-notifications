import { useNavigate } from "@shopify/app-bridge-react";
import {
  Card,
  Icon,
  Checkbox,
  IndexTable,
  Link,
  Stack,
  TextStyle,
  Thumbnail,
  UnstyledLink,
} from "@shopify/polaris";
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";

/* useMedia is used to support multiple screen sizes */
import { useMedia } from "@shopify/react-hooks";

import MessageCheckbox from "../components/utils/Checkbox";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({
  id,
  title,
  product,
  discountCode,
  scans,
  createdAt,
  navigate,
}) {
  return (
    <UnstyledLink onClick={() => navigate(`/messages/${id}`)}>
      <div
        style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}
      >
        <Stack>
          <Stack.Item>
            <Thumbnail
              source={product?.images?.edges[0]?.node?.url || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </Stack.Item>
          <Stack.Item fill>
            <Stack vertical={true}>
              <Stack.Item>
                <p>
                  <TextStyle variation="strong">
                    {truncate(title, 35)}
                  </TextStyle>
                </p>
                <p>{truncate(product?.title, 35)}</p>
                <p>{dayjs(createdAt).format("MMMM D, YYYY")}</p>
              </Stack.Item>
              <div style={{ display: "flex" }}>
                <div style={{ flex: "3" }}>
                  <TextStyle variation="subdued">Discount</TextStyle>
                  <p>{discountCode || "-"}</p>
                </div>
                <div style={{ flex: "2" }}>
                  <TextStyle variation="subdued">Scans</TextStyle>
                  <p>{scans}</p>
                </div>
              </div>
            </Stack>
          </Stack.Item>
        </Stack>
      </div>
    </UnstyledLink>
  );
}

export function MessageIndex({ Messages, loading, updateMessage }) {
  const navigate = useNavigate();

  /* Check if screen is small */
  const isSmallScreen = useMedia("(max-width: 640px)");

  /* Map over Messages for small screen */
  const smallScreenMarkup = Messages.map((Message) => (
    <SmallScreenCard key={Message.id} navigate={navigate} {...Message} />
  ));

  const resourceName = {
    singular: "Message",
    plural: "Messages",
  };

  const rowMarkup = Messages.map(
    ({ id, value, type, impressions, status, shopDomain }, index) => {

      /* The form layout, created using Polaris components. Includes the QR code data set above. */
      return (
        <IndexTable.Row
          id={id}
          key={id}
          position={index}
        >
          <IndexTable.Cell>
            <MessageCheckbox MessageId={id} status={status} updateMessage={updateMessage} />
          </IndexTable.Cell>
          <IndexTable.Cell>
              {status === 1 ? <p>{value}</p> : <p style={{color: "grey"}}>{value}</p>}
          </IndexTable.Cell>
          <IndexTable.Cell>{type}</IndexTable.Cell>
          <IndexTable.Cell>{impressions}</IndexTable.Cell>
          <IndexTable.Cell><Link onClick={() => navigate(`/messages/${id}`)}>Edit</Link></IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  /* A layout for small screens, built using Polaris components */
  return (
    <Card>
      {isSmallScreen ? (
        smallScreenMarkup
      ) : (
        
        <IndexTable
          resourceName={resourceName}
          itemCount={Messages.length}
          headings={[
            { title: "Status" },
            { title: "Message" },
            { title: "Type" },
            { title: "Impressions" },
            { title: "Actions" },
          ]}
          selectable={false}
          loading={loading}
        >
          {rowMarkup}
        </IndexTable>
      )}
    </Card>
  );
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "???" : str;
}
