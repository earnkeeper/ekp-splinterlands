export type TransactionDto = Readonly<{
  id: string;
  block_id: string;
  prev_block_id: string;
  type: string;
  player: string;
  affected_player: string;
  data: string;
  success: boolean;
  error: any;
  block_num: number;
  created_date: string;
  result: string;
  steem_price: any;
  sbd_price: any;
}>;
