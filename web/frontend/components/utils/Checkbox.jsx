import {Checkbox} from '@shopify/polaris';
import {useState, useCallback} from 'react';
import { useAuthenticatedFetch, useAppQuery } from "../../hooks";

function MessageCheckbox(props) {
  let isChecked = null;
  if(props.status === 0){
   isChecked = false;
  }else{
   isChecked = true;
  }
  const [checked, setChecked] = useState(isChecked);
  // const handleChange = useCallback((newChecked) => setChecked(newChecked), []);
  const fetch = useAuthenticatedFetch();
  const handleChange = useCallback(async (newChecked) => {
    setChecked(newChecked);
    const url = `/api/messages/stop/${props.MessageId}`;
    const response = await fetch(url, { 
      method: "PATCH",
      body: JSON.stringify({ status: newChecked, id: props.MessageId }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const message = await response.json();
      props.updateMessage(message);
    }
  }, []);
  
  return (
    <Checkbox
      checked={checked}
      onChange={handleChange}
    />
  );
}
export default MessageCheckbox;