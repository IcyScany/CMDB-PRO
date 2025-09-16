/*
 表格行拖拽
 */
import {onMounted, onUnmounted, ref, nextTick} from "vue";
import Sortable from 'sortablejs';
import { message } from 'ant-design-vue';
import http from '@/utils/axios';
import successModal from '@/composables/successModal';

// 可以传入dragSortEndAjax方法，提供单独的拖拽后请求接口的逻辑
// 如果不传dragSortEndAjax方法，则执行默认的请求接口逻辑，此时需传入urlPrefix和getData方法（clientTable的getData方法）
export default function dragSort(tableRef, handle, gridOptions, sortField, dragSortEndAjax, urlPrefix, getData, sortUrl = 'sort') {
    let sortable1 = ref(null); // 拖拽实例

    onMounted(() => {
        dragSort();
    });
    onUnmounted(() => {
        if (sortable1.value) {
            sortable1.value.destroy();
        }
    });

    // 行拖拽
    // 可以传入dragSortEndAjax方法，提供单独的拖拽后请求接口的逻辑
    // sortField：数据库中用来标识排序的字段
    function dragSort() {
        const el = tableRef.value.$el.querySelector('.vxe-table--body tbody');
        sortable1.value = Sortable.create(el, {
            handle: handle,
            onEnd: e => {
                const { oldIndex, newIndex } = e;
                if (oldIndex === newIndex) {
                    message.warning('单行不能排序');
                    return;
                }
                let exchangeList = [];
                // 从上往下拖
                if (oldIndex < newIndex) {
                    // 循环受影响的行（其他行都往前移了一行）
                    for (let i = oldIndex + 1; i <= newIndex; i++) {
                        exchangeList.push([gridOptions.data[i][sortField], gridOptions.data[i - 1][sortField]]);
                    }
                } else {
                    // 从下往上拖
                    // 循环受影响的行（其他行都往后移了一行）
                    for (let i = oldIndex - 1; i >= newIndex; i--) {
                        exchangeList.push([gridOptions.data[i][sortField], gridOptions.data[i + 1][sortField]]);
                    }
                }
                // 拖动的这行的sorting数据
                exchangeList.push([gridOptions.data[oldIndex][sortField], gridOptions.data[newIndex][sortField]]);

                // 请求接口
                if (dragSortEndAjax) {
                    dragSortEndAjax(exchangeList, gridOptions.data[oldIndex].id);
                } else { // 默认的请求ajax逻辑（针对clientTable）
                    http.put(`${urlPrefix}${sortUrl}?sid=${gridOptions.data[oldIndex].id}`, {
                        sorting: exchangeList,
                        sid: gridOptions.data[oldIndex].id,
                    }).then((res) => {
                        successModal({content: res.msg});
                        getData();
                    }).catch(() => {
                        nextTick(() => {
                            getData();
                        });
                    });
                }
            }
        });
    }
    return {
        sortable1,
    };
}
