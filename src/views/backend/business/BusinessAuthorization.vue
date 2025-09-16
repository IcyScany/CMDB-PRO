<script setup>
import {onMounted, ref} from "vue";
import http from "@/utils/axios";
import successModal from "@/composables/successModal";

const  pageUrl = 'manage/business/authorization/';
let pageData  = ref({}); // 页面的数据
let getPageDataLoading = ref(false); // 初始进入页面获取数据的loading
let currBusiness = ref(null); // 当前的业态
let expandList = ref({}); // 二级菜单是否展开列表

const initBusinessDataAuth = { // 用于不同的菜单对应的权限
    menu: [],
    title: [],
    layer: [],
};
let diffBusinessPermission = ref(initBusinessDataAuth);
let businessCheckLoading = ref(false); // 切换业态选择权限的loading
let submitBusinessloading = ref(false); // 业态权限点击提交按钮时发送的请求

onMounted(async () => {
    await handlePageDataGet();
});

/** 获取基础的业态列表数据 --Start**/
async function handlePageDataGet() {
    getPageDataLoading.value = true;
    businessCheckLoading.value = false;
    submitBusinessloading.value = false;
    pageData.value = {};
    http.get(`${pageUrl}list`)
        .then(res => {
            pageData.value = res?.data ? res.data : {};
            getPageDataLoading.value = false;
        })
        .catch(() => {
            getPageDataLoading.value = false;
        });
}
/** 获取基础的业态列表数据 --END**/


/** 切换当前的业态的处理
 * 读取某一个业态的授权数据
 * --start
 * **/
function handleChangeBusiness(e) {
    diffBusinessPermission.value = initBusinessDataAuth;
    businessCheckLoading.value = true;
    http.get(`${pageUrl}list/${e.target.value}`)
        .then((res) => {
            diffBusinessPermission.value = res?.data ? res.data : initBusinessDataAuth;
            diffBusinessPermission.value['layer'] = [];
            businessCheckLoading.value = false;
        })
        .catch(() => {
            businessCheckLoading.value = false;
        });
}
/** 切换当前的业态的处理
 * 读取某一个业态的授权数据
 * --end
 * **/

/** 不同层号下的title、button 勾选的时候 --Start**/


/** 不同层号下的title、button 勾选的时候 --End**/

// 勾选/取消权限：checked表示是否指定勾选/取消勾选
function toggleCheck({key, type, checked}) {
    let index = diffBusinessPermission.value[type].indexOf(key);
    if (!checked && index !== -1) { // 1. 不指定的情况；2. 指定取消勾选的情况。并且目前已勾选。则需要去除
        diffBusinessPermission.value[type].splice(index, 1);
    }
    if (index === -1 && (checked === true || checked === undefined)) { // 1. 不指定的情况；2. 指定勾选的情况。并且目前未勾选。则需要增加
        diffBusinessPermission.value[type].push(key);
    }
}

function handleCheckPermission({key,level1,level2, type, layer, title, button, num, idx}) {
    toggleCheck({key, type});
    let index = diffBusinessPermission.value[type].indexOf(key);
    switch (index) {
        case -1: { // 未选中的时候
            if (type === 'layer') { // 所有title取消选中
                for (let t of title) {
                    toggleCheck({key:t.sid, type:'title', checked: false});
                }
                for (let b of button) {
                    toggleCheck({key:b.sid, type:'title', checked: false});
                }
            }
            if (type === 'menu' && num === 2) { // 二级菜单未勾选的时候所有title、层号无需选中
                let data = pageData.value?.['menus']?.[idx]?.['menus']?.[level2]?.title_button;
                if (data) {
                    for (let item in data) {
                        let { title, button } = data[item];
                        toggleCheck({key:`${level1}_${level2}_${item}`, type:'layer', checked: false});
                        for (let t of title) {
                            toggleCheck({key:t.sid, type:'title', checked: false});
                        }
                        for (let b of button) {
                            toggleCheck({key:b.sid, type:'title', checked: false});
                        }
                    }

                }
            }
            if (type === 'menu' && num === 1) { // 一级菜单未勾选的时候所有二级菜单、层号、title无需选中
                let currentCheckedMenuData = pageData.value?.['menus']?.[idx]?.['menus'];
                if (currentCheckedMenuData) {
                    for (let level2_id in currentCheckedMenuData) {
                        toggleCheck({key:level2_id * 1, type:'menu', checked: false});
                        let { title_button } = currentCheckedMenuData[level2_id];
                        if (title_button) {
                            for (let item in title_button) {
                                let { title, button } = title_button[item];
                                toggleCheck({key:`${level1}_${level2_id * 1}_${item}`, type:'layer', checked: false});
                                for (let t of title) {
                                    toggleCheck({key:t.sid, type:'title', checked: false});
                                }
                                for (let b of button) {
                                    toggleCheck({key:b.sid, type:'title', checked: false});
                                }
                            }
                        }
                    }
                }
            }
            break;
        }
        default: {// 选中的时候
            if (type === 'title') { // 其对应的父级一级菜单、二级菜单、层号需选中
                toggleCheck({key:level1, type:'menu', checked: true});
                toggleCheck({key:level2, type:'menu', checked: true});
                toggleCheck({key:`${level1}_${level2}_${layer}`, type:'layer', checked: true});
            }
            if (type === 'layer') { // 其对应的父级一级菜单、二级菜单、所有title需选中
                toggleCheck({key:level1, type:'menu', checked: true});
                toggleCheck({key:level2, type:'menu', checked: true});
                for (let t of title) {
                    toggleCheck({key:t.sid, type:'title', checked: true});
                }
                for (let b of button) {
                    toggleCheck({key:b.sid, type:'title', checked: true});
                }

            }
            if (type === 'menu' && num === 2) { // 二级菜单勾选的时候所有title、层号、一级菜单需选中
                let data = pageData.value?.['menus']?.[idx]?.['menus']?.[level2]?.title_button;
                toggleCheck({key:level1, type:'menu', checked: true});
                if (data) {
                    for (let item in data) {
                        let { title, button } = data[item];
                        toggleCheck({key:`${level1}_${level2}_${item}`, type:'layer', checked: true});
                        for (let t of title) {
                            toggleCheck({key:t.sid, type:'title', checked: true});
                        }
                        for (let b of button) {
                            toggleCheck({key:b.sid, type:'title', checked: true});
                        }
                    }

                }
            }
            if (type === 'menu' && num === 1) { // 一级菜单选中的时候所有二级菜单、层号、title需选中
                let currentCheckedMenuData = pageData.value?.['menus']?.[idx]?.['menus'];
                if (currentCheckedMenuData) {
                    for (let level2_id in currentCheckedMenuData) {
                        toggleCheck({key:level2_id * 1, type:'menu', checked: true});
                        let { title_button } = currentCheckedMenuData[level2_id];
                        if (title_button) {
                            for (let item in title_button) {
                                let { title, button } = title_button[item];
                                toggleCheck({key:`${level1}_${level2_id * 1}_${item}`, type:'layer', checked: true});
                                for (let t of title) {
                                    toggleCheck({key:t.sid, type:'title', checked: true});
                                }
                                for (let b of button) {
                                    toggleCheck({key:b.sid, type:'title', checked: true});
                                }
                            }
                        }
                    }
                }
            }
            break;
        }

    }
}

/** 全选复选框勾选相关 --Start**/
// 全选复选框的处理
let checkboxAllState = ref({
    checkAll: false,
    indeterminate: false,
});

// 全选/取消
function toggleCheckAll() {
    checkboxAllState.value.checkAll = !checkboxAllState.value.checkAll;
    checkAllData(checkboxAllState.value.checkAll);
}

function checkAllData(isChecked) {
    let currentCheckedMenuData = pageData.value?.['menus'];
    if (currentCheckedMenuData) {
        for (let level1Data of  currentCheckedMenuData) {
            let { sid, menus } = level1Data;
            toggleCheck({key: sid, type:'menu', checked: isChecked});

            for (let level2_id in menus) {
                toggleCheck({key:level2_id * 1, type:'menu', checked: isChecked});
                let { title_button } = menus[level2_id];
                if (title_button) {
                    for (let item in title_button) {
                        let { title, button } = title_button[item];
                        toggleCheck({key:`${sid}_${level2_id * 1}_${item}`, type:'layer', checked: isChecked});
                        for (let t of title) {
                            toggleCheck({key:t.sid, type:'title', checked: isChecked});
                        }
                        for (let b of button) {
                            toggleCheck({key:b.sid, type:'title', checked: isChecked});
                        }
                    }
                }
            }
        }

    }
}
/** 全选复选框勾选相关 --end**/

/** 业态提交的更新 --Start**/
function handleSubmitBusiness() {
    if (currBusiness.value) {
        submitBusinessloading.value = true;
        businessCheckLoading.value = true;
        http.put(`${pageUrl}${currBusiness.value}`, {
            title_sid: diffBusinessPermission.value.title,
            menu_sid:  diffBusinessPermission.value.menu,
        })
            .then((res) => {
                businessCheckLoading.value = false;
                submitBusinessloading.value = false;
                successModal({title: res?.msg});
            })
            .catch(() => {
                businessCheckLoading.value = false;
                submitBusinessloading.value = false;
            });
    }
}
/** 业态提交的更新 ---End**/

</script>
<template>
  <a-card :loading="getPageDataLoading">
    <div class="part-box">
      <vxe-button  status="primary" content="业态" disabled/>
      <div class="part-content-box">
        <a-radio-group v-if="Object.keys(pageData).length && pageData?.business" v-model:value="currBusiness" @change="handleChangeBusiness">
          <a-radio v-for="({business}, id) in pageData?.business" :key="id" :value="id">
            {{ business }}
          </a-radio>
        </a-radio-group>
        <a-empty v-else>
          <template #description>
            无业态数据
          </template>
        </a-empty>
      </div>
    </div>
    <div  class="part-box">
        <a-checkbox
            :checked="checkboxAllState.checkAll"
            :indeterminate="checkboxAllState.indeterminate"
            @click="toggleCheckAll"
        >
            全选
        </a-checkbox>
      <div class="part-content-box">
          <a-spin :spinning="businessCheckLoading">
              <template v-if="Object.keys(pageData).length && pageData?.menus">
                  <template v-for="(list, idx) in pageData?.menus" :key="list.sid"> <!--一级菜单-->
                      <a-checkbox :checked="diffBusinessPermission.menu.includes(list.sid)" @click="handleCheckPermission({key: list.sid, type: 'menu', num: 1, idx,  level1:list.sid,})">
                         <h3> {{ list?.menu_name }}</h3>
                      </a-checkbox>
                      <div class="m1-content-box">
                          <template v-for="(list2, level2_id) in list.menus" :key="level2_id"> <!--二级菜单-->
                            <div>
                                <i
                                    :class="[expandList[level2_id] ? 'vxe-icon-arrow-down' : 'vxe-icon-arrow-up', 'm2-expand-icon', 'text-info']"
                                    @click="expandList[level2_id] = !expandList[level2_id]"
                                />
                                <a-checkbox  :checked="diffBusinessPermission.menu.includes(level2_id * 1)"  @click="handleCheckPermission({key: level2_id * 1, type: 'menu', level1:list.sid,  level2: level2_id, num: 2, idx})">
                                    <h4><vxe-tag class="theme--primary">{{ list2?.menu_name }}</vxe-tag></h4>  <!--二级菜单的复选框   -->
                                </a-checkbox>
                            </div>
                              <div v-show="expandList[level2_id]" class="m2-content-box">
                                  <template v-if="list2?.title_button">
                                      <template v-for="({title, button}, layer) in list2?.title_button" :key="`${list.sid}_${level2_id}_${layer}`">
                                          <!-- 层号的复选框 -->
                                          <a-checkbox :checked="diffBusinessPermission.layer.includes(`${list.sid}_${level2_id}_${layer}`)" @click="handleCheckPermission({key: `${list.sid}_${level2_id}_${layer}`, level1:list.sid, level2: level2_id * 1, layer, idx, title, button, type: 'layer'})">
                                              层号: {{ layer }}
                                          </a-checkbox>
                                          <div class="layer-box">
                                              <!-- title与button的复选框   -->
                                              <a-checkbox v-for="t in title" :key="t?.sid" :checked="diffBusinessPermission.title.includes(t.sid)" @click="handleCheckPermission({key: t.sid, level1:list.sid, level2: level2_id * 1, layer, idx, type: 'title'})">
                                                  {{ t.field_name }}
                                              </a-checkbox>
                                              <a-checkbox v-for="b in button" :key="b.sid"  :checked="diffBusinessPermission.title.includes(b.sid)" @click="handleCheckPermission({key: b.sid, level1:list.sid, level2: level2_id * 1, layer, idx, type: 'title'})">
                                                  <b class="text-error bold-class-btn">B</b>
                                                  {{ b.field_name }}
                                              </a-checkbox>
                                          </div>
                                      </template>
                                  </template>
                              </div>
                          </template>
                      </div>
                  </template>
              </template>
              <a-empty v-else>
                  <template #description>
                      无菜单数据
                  </template>
              </a-empty>
          </a-spin>
      </div>
    </div>
      <vxe-button v-if="currBusiness" :loading="submitBusinessloading"  status="primary" size="default" content="Submit" class="submit-btn" @click="handleSubmitBusiness"></vxe-button>
  </a-card>

</template>



<style scoped lang="less">
.part-title {
  margin-right: 10px;
}
.part-content-box {
  padding: 1.5rem;
}
.m1-content-box, .m2-content-box, .layer-box {
  padding-left: calc(1rem + 8px);
    .m2-expand-icon {
        margin-right: 10px;
        cursor: pointer;
    }
}
.ant-checkbox-wrapper {
  margin: 5px 0;
}
.ant-checkbox-group {
  width: 100%;
}
.bold-class-btn {
    width: 25px;
    height: 25px;
    display: inline-block;
    text-align: center;
    font-size: 16px;
    border-radius: 50%;
    border: 1px solid red;
}
.submit-btn {
  position: fixed;
  bottom: 8%;
  right: 2%;
}
</style>
