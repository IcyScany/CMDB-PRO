<script setup>
import http from '@/utils/axios';
import { reactive, computed } from 'vue';

const props = defineProps({
    uuid: {
        type: [String, Array],
        required: true
    },
    objType: {
        type: String,
        required: true
    }
});

// 统一 uuid 为数组
const uuidList = computed(() => {
    if (Array.isArray(props.uuid)) return props.uuid;
    if (typeof props.uuid === 'string' && props.uuid.indexOf(',') > -1) {
        return props.uuid.split(',').map(item => item.trim()).filter(Boolean);// 过滤空字符串
    }
    return [props.uuid];
});

// 为每个 uuid 维护独立的 infoRenderState
const infoRenderStates = reactive({});

const infoCnText = {
    name: '名称',
    description: '描述',
    uuid: 'ID'
};

const fetchInfo = async (uuid) => {
    if (infoRenderStates[uuid]?.isDataFetched) return;
    if (!infoRenderStates[uuid]) {
        infoRenderStates[uuid] = { name: '', description: '', uuid, isDataFetched: false };
    }
    try {
        const response = await http.get(`/public/name-info/${props.objType}/${uuid}`, { noErrorTip: true });
        infoRenderStates[uuid].name = response?.name || '';
        infoRenderStates[uuid].description = response?.description || '';
        infoRenderStates[uuid].isDataFetched = true;
    } catch (e) {
        infoRenderStates[uuid].name = '';
        infoRenderStates[uuid].description = '';
        infoRenderStates[uuid].isDataFetched = true;
    }
};

const hasAll = (uuid) => {
    const info = infoRenderStates[uuid];
    return info && info.name && info.description && info.uuid;
};

onMounted(async () => {
    await Promise.all(uuidList.value.map(uuid => fetchInfo(uuid)));
});

</script>

<template>
  <template v-for="uid in uuidList" :key="uid">
    <a-popover
      trigger="hover"
      placement="topLeft"
      overlay-class-name="uuid-name-info-popover"
      :overlay-inner-style="{ width: '380px', padding: '10px' }"
      @open-change="(visible) => visible && fetchInfo(uid)"
    >
      <template #title>
        <span v-if="hasAll(uid)" class="w-50 inline-block cn-name-render">{{ infoCnText['name'] }}：</span>
        {{ infoRenderStates[uid]?.name || infoRenderStates[uid]?.description }}
      </template>
      <template #content>
        <div class="name-info-popover">
          <div class="name-info-item-desc">
            <span v-show="infoRenderStates[uid]?.name" class="value description">
              <span v-if="hasAll(uid)" class="w-50 inline-block cn-name-render">{{ infoCnText['description'] }}：</span>
              {{ infoRenderStates[uid]?.description }}
            </span>
          </div>
          <div class="name-info-item mb-5 mt-2">
            <a-flex>
              <span v-if="hasAll(uid)" class="w-50 inline-block cn-name-render uuid">{{ infoCnText['uuid'] }}：</span>
              <a-typography-paragraph :copyable="{ tooltip: false }">
                {{ uid }}
              </a-typography-paragraph>
            </a-flex>
          </div>
        </div>
      </template>
      <span class="text-primary name-info">
        <slot>{{ infoRenderStates[uid]?.name || infoRenderStates[uid]?.description || uid }} <span v-if="uid !== uuidList[uuidList.length - 1]">,</span> </slot>
      </span>
    </a-popover>
  </template>
</template>

<style lang="less" scoped>
.name-info{
    
    &:hover{
        text-decoration: underline;
    }
}
.cn-name-render {
    display: inline-block !important;
    width: 44px !important;
    &.uuid {
      color: #000!important;
    }
}
.uuid-name-info-popover {
    width: 50%;
    height: 100px;
   
}

.name-info-popover {
  .name-info-item-desc {
    color: #353232 !important;
    font-size: 14px;
  }


  .name-info-item {
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: rgba(0, 0, 0, 0.45);
      margin-right: 8px;
    }

    .value {
      color: rgba(0, 0, 0, 0.85);
      &.description {
          color: #ccc !important;
          font-size: 14px;
      }

      &.id {
        &:hover {
          color: #1890ff;
        }
      }
    }
  }
}
</style>
