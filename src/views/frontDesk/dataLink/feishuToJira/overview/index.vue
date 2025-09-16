<script setup>
import feishuToJira from '@/api/dataLink/feishuToJira';
import { computed } from 'vue';

let { getOverview } = feishuToJira;
const state = ref({});

onMounted(async () => {
    try {
        let res = await getOverview();
        state.value = res || {};
    } catch (error) {
        console.log(error);
    }
});

// 统计卡片颜色
const summaryColor = {
    0: '#e88250',
    1: '#3c79bf',
    2: '#4fb050',
};

// 数据分组
const section1 = computed(() => state.value.section1 || []);
const statCards = computed(() => section1.value.filter((_, idx) => idx !== 1));
const approvalCard = computed(() => section1.value[1]);

// 审批单数量表格数据处理
function getApprovalTable(items) {
    if (!items) return { names: [], statuses: [], map: {} };
    const names = Array.from(new Set(items.map(i => i.feishu_approval_name)));
    const statuses = Array.from(new Set(items.map(i => i.feishu_status)));
    const map = {};
    items.forEach(i => {
        if (!map[i.feishu_status]) map[i.feishu_status] = {};
        map[i.feishu_status][i.feishu_approval_name] = i.count;
    });
    return { names, statuses, map };
}
const approvalTable = computed(() => getApprovalTable(approvalCard.value?.items));
const totalCount = computed(() => {
    return section1.value[0]?.items?.[0]?.count ?? 0;
});
</script>

<template>
  <div v-if="Object.keys(state).length > 0">
    <div v-if="totalCount > 0" class="overview-container">
      <!-- 其它统计卡片 -->
      <div class="summary-box">
        <div
          v-for="(item, idx) in statCards"
          :key="idx"
          class="summary-item"
          :style="{ '--summary-color': summaryColor[idx] }"
        >
          <div v-for="(content, cIdx) in item.items" :key="cIdx" class="w-full ">
            <div v-for="field in item.fields" :key="field" class="w-full flex justify-around">
              <div class="summary-data">
                <div class="summary-value" style="font-size: 26px;" :style="{color: content?.[field] === '同步成功'? 'var(--success-color)' : 'var(--warning-color)'}">{{ content.count }}</div>
                <div class="summary-title">{{ content?.[field] || '未知' }}</div>
              </div>
                <div v-if="idx === 0" class="summary-icon text-center">
                    <SvgIcon iconname="icon-feishu" class="text-[37px]"/>
                </div>
              
              <div class="summary-border"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 审批单数量表格卡片 -->
      <div v-if="approvalCard" class="approval-table-card">
        <table class="border-collapse border custom-table custom-table-bordered">
          <thead>
            <tr>
              <th></th>
              <th v-for="name in approvalTable.names" :key="name" class="text-center">{{ name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="status in approvalTable.statuses" :key="status">
              <td class="text-center">
                <vxe-tag :class="status == '通过' ? 'theme--success' : 'theme--warning'" size="small" class="m-1">
                  {{ status }}
                </vxe-tag>
                
              </td>
              <td v-for="name in approvalTable.names" :key="name" class="text-center">
                {{ approvalTable.map[status]?.[name] || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="summary-border"></div>
      </div>
    </div>
    <a-empty v-else ></a-empty>
  </div>
  <a-empty v-else></a-empty>
</template>

<style scoped lang="less">
:deep(.ant-card) {
    margin-top: 14px;
    box-shadow: 0 4px 4px rgba(0,0,0,0.08);
    .ant-card-body {
        padding: 0px 24px 24px 24px;
    }
}

.overview-container {
    flex: auto;
    overflow: auto;
    padding: 0 4px;
    padding-bottom: 24px;
    .summary-box {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        margin: 20px 0;
        .summary-item {
            position: relative;
            flex: 1 1 160px;
            display: flex;
            align-items: center;
            justify-content: space-around;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            padding: 20px 10px;
            .summary-value {
                font-size: 32px;
                font-weight: 600;
                color: var(--summary-color);
                margin-bottom: 8px;
            }
            .summary-title {
                font-size: 14px;
                color: #666;
            }
            .summary-icon {
                width: 40px;
                height: 40px;
                background: var(--summary-color);
                opacity: 0.3;
                border-radius: 8px;
                img {
                    width: 100%;
                    height: 100%;
                }
            }
            .summary-border {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 90%;
                transform: translateX(5%);
                height: 3px;
                border-radius: 2px;
                background: var(--summary-color);
            }
        }
    }
    .approval-table-card {
      margin-top: 32px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      padding: 24px;
      table {
        width: 100%;
        border: 1px solid #eee;
        th, td {
          border: 1px solid #eee;
          padding: 8px 12px;
        }
        th {
          background: #fafafa;
        }
      }
      .summary-border {
        margin-top: 12px;
        height: 3px;
        background: #4fb050;
        border-radius: 2px;
      }
    }
}
.theme--success,
.theme--warning {
    background: none;
}

</style>
