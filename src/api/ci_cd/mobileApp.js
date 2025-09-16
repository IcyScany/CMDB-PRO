import http from '@/utils/axios';


let baseUrl = '/ci_cd/mobile-app/';
let urlPrefix = {
    apps: { //我的应用
        list: `${baseUrl}apps/list`, // 获取应用列表、应用详情
        edit: `${baseUrl}apps/edit`, // 更新应用
        del: `${baseUrl}apps/del`, // 删除应用
        add: `${baseUrl}apps/add`, // 创建应用
    },
    build_configs: { //应用构建配置
        list: `${baseUrl}build-configs/list`, // 获取应用构建配置列表
        edit: `${baseUrl}build-configs/edit`, // 更新应用构建配置
        del: `${baseUrl}build-configs/del`, // 删除应用构建配置
        add: `${baseUrl}build-configs/add`, // 创建应用构建配置
    },

    deployment_targets: { //应用部署目标
        list: `${baseUrl}deployment-targets/list`, // 获取应用部署目标列表
        edit: `${baseUrl}deployment-targets/edit`, // 更新应用部署目标
        del: `${baseUrl}deployment-targets/del`, // 删除应用部署目标
        add: `${baseUrl}deployment-targets/add`, // 创建应用部署目标
        deployment: `${baseUrl}releases/deployment`, // 部署应用
    },
    releases: { //应用发布记录
        list: `${baseUrl}releases/list`, // 获取应用发布记录列表
        edit: `${baseUrl}releases/edit`, // 更新应用发布记录
        del: `${baseUrl}releases/del`, // 删除应用发布记录
        add: `${baseUrl}releases/add`, // 创建应用发布记录
        nextVersion: `${baseUrl}releases/next_internal_version_code`, // 计算下一个内部版本号
    },
};

export default {
    // 获取应用列表
    getAppList(app_id=null) {
        return http.get(`${urlPrefix.apps.list}${app_id ? `/${app_id}` : ''}`, {showLoading: true});
    },
    postAppList(data) {
        return http.post(`${urlPrefix.apps.list}`, data);
    },

    // 创建应用
    postAdd(data) {
        return http.post(`${urlPrefix.apps.add}`, data);
    },
    // 更新应用
    putMobileAppEdit(app_id, data) {
        return http.put(`${urlPrefix.apps.edit}/${app_id}`, data);
    },
    // 删除应用
    del(app_id) {
        return http.delete(`${urlPrefix.apps.del}/${app_id}`);
    },

    // 获取应用构建配置列表
    getBuildConfigList(app_id=null) {
        return http.get(`${urlPrefix.build_configs.list}${app_id ? `/${app_id}` : ''}`, {showLoading: true});
    },
    // 创建应用构建配置
    postAddBuildConfig(data) {
        return http.post(`${urlPrefix.build_configs.add}`, data);
    },
    // 更新应用构建配置
    putBuildConfigEdit(build_config_id, data) {
        return http.put(`${urlPrefix.build_configs.edit}/${build_config_id}`, data);
    },
    // 删除应用构建配置
    delBuildConfig(build_config_id) {
        return http.delete(`${urlPrefix.build_configs.del}/${build_config_id}`);
    },

    // 获取应用部署目标详情
    getDeploymentTargetDetail(target_id=null) {
        return http.get(`${urlPrefix.deployment_targets.list}${target_id ? `/${target_id}` : ''}`, {showLoading: true});
    },
    // 获取部署目标列表
    /* id: 目标id 
    name: 目标名称
    platform: 目标平台
    type: 目标类型
    is_active: 是否激活
    */
    getDeploymentTargetList({id=null, name=null, platform=null, type=null, is_active=null}) {
        let params = '';
        if (id) {
            params += `id=${id}&`;
        }
        if (name) {
            params += `name=${name}&`;
        }
        if (platform) {
            params += `platform=${platform}&`;
        }
        if (type) {
            params += `type=${type}&`;
        }
        if (is_active) {
            params += `is_active=${is_active}&`;
        }
        return http.get(`${urlPrefix.deployment_targets.list}?${params}`, {showLoading: true});
    },
    postDeploymentTargetList(data) {
        return http.post(`${urlPrefix.deployment_targets.list}`, data);
    },
    // 创建应用部署目标
    postAddDeploymentTarget(data) {
        return http.post(`${urlPrefix.deployment_targets.add}`, data);
    },
    // 更新应用部署目标
    putDeploymentTargetEdit(deployment_target_id, data) {
        return http.put(`${urlPrefix.deployment_targets.edit}/${deployment_target_id}`, data);
    },
    // 删除应用部署目标
    delDeploymentTarget(deployment_target_id) {
        return http.delete(`${urlPrefix.deployment_targets.del}/${deployment_target_id}`);
    },
    // 部署应用
    postDeployment(data) {
        return http.post(`${urlPrefix.deployment_targets.deployment}`, data);
    },


    // 获取应用发布记录列表
    getReleaseList(app_id=null) {
        return http.get(`${urlPrefix.releases.list}${app_id ? `/${app_id}` : ''}`, {showLoading: true});
    },
    // 创建应用发布记录列表
    postReleaseList(data) {
        return http.post(`${urlPrefix.releases.list}`, data);
    },
    // 创建应用发布记录
    /* 应用的开始构建、部署 
    需要传入以下参数：
     deployment_target_ids: 部署目标id列表（deployment_target_ids为null时，则不进行部署）
    */
    postAddRelease(data) {
        return http.post(`${urlPrefix.releases.add}`, data);
    },
    // 更新应用发布记录
    putReleaseEdit(release_id, data) {
        return http.put(`${urlPrefix.releases.edit}/${release_id}`, data);
    },
    // 删除应用发布记录
    delRelease(release_id) {
        return http.delete(`${urlPrefix.releases.del}/${release_id}`);
    },
    // 计算下一个内部版本号
    /*
    接口参数：
    app_id：应用id
    new_marketing_version：新的营销版本号
    */
    getNextVersion(app_id, new_marketing_version) {
        return http.get(`${urlPrefix.releases.nextVersion}?app_id=${app_id}&new_marketing_version=${new_marketing_version}`, {showLoading: true});
    },

};

