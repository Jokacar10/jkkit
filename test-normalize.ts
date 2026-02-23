import { Cell, loadMessage, beginCell, storeMessage } from '@ton/core';

// create a dummy ext in message
const msgCell = beginCell()
  .storeUint(2, 2) // ext_in_msg_info
  .storeUint(0, 2) // src: addr_none
  .storeUint(0, 2) // dest: addr_none
  .storeCoins(123) // import_fee
  .storeUint(0, 1) // init: None
  .storeUint(0, 1) // body: None
  .endCell();

const msg = loadMessage(msgCell.beginParse());
console.log(msg.info);
