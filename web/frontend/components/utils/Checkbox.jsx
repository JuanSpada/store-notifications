import {Checkbox} from '@shopify/polaris';
import {useState, useCallback} from 'react';

function MessageCheckbox(status) {
  let isChecked = null;
  if(status.status === 0){
   isChecked = false;
  }else{
   isChecked = true;
  }
  const [checked, setChecked] = useState(isChecked);
  const handleChange = useCallback((newChecked) => setChecked(newChecked), []);

  return (
    <Checkbox
      checked={checked}
      onChange={handleChange}
    />
  );
}
export default MessageCheckbox;