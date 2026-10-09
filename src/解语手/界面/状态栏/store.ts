import { defineMvuDataStore } from '@util/mvu';
import { Schema } from '../../schema';

// 本界面所在楼层的 MVU 变量；读写 store.data 自动与 stat_data 双向同步
export const useDataStore = defineMvuDataStore(Schema, {
  type: 'message',
  message_id: getCurrentMessageId(),
});