import * as axios from "axios";
import {baseUrl} from '../common/config/config';

const instance = axios.create({
    baseURL: baseUrl,
})

// const headers = {"Content-Type": "multipart/form-data"}

instance.interceptors.request.use(
    config => {
        const token = JSON.parse(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user')).token : '';

        if (token) {
            config.headers.Authorization = token;
        } else {
            delete instance.defaults.headers.common.Authorization;
        }
        return config;
    },

    error => Promise.reject(error)
);

export const usersApi = {
    getAllUsers() {
        return instance.get(`users/`);
    },
    addToProject(userid, projectid) {
        console.log("userid, projectid", userid, projectid)
        return instance.post(`projects/${projectid}/users/projects/active`, {
            userid, projectid
        });
    },
    removeFromProject(userid, projectid) {
        return instance.delete(`projects/${projectid}/users/projects/active`, {
            params: {
                userid, projectid
            }
        });
    },
    getActiveUsers(projectId) {
        return instance.get(`projects/${projectId}/users/active`, {
            params: {
                projectId
            }
        });
    }
}

export const projectsApi = {
    createNewProject(projectName, userId, background) {
        return instance.post(`projects/`, {
            name: projectName,
            userId: userId,
            background
        })
    },
    editProject(id, name, userId) {
        return instance.put(`projects/${id}`, {
            name, userId
        })
    },
    removeProject(projectId, userId) {
        return instance.delete(`projects/${projectId}`)
    },
    getAllProjects(userId) {
        return instance.get(`projects/`, {
            params: {
                userId
            }
        });
    }
};

export const columnsApi = {
    removeColumn(columnId, projectId) {
        return instance.delete(`/projects/${projectId}/${columnId}/columns`)
    },

    updateColumn(columnId, name, projectId) {
        return instance.put(`/projects/${projectId}/${columnId}/columns`, {
            name
        })
    },

    createNewColumn(name, projectListId, position) {
        return instance.post(`projects/${projectListId}/columns`, {
            name, position
        })
    },

    getColumns(projectId) {
        return instance.get(`projects/${projectId}/columns/`);
    },

    updateColumnsPosition(newColumns, projectId) {
        console.log("firstId, lastId, firstPosition, lastPosition", newColumns)
        return instance.put(`/projects/${projectId}/columns/position`, {
            newColumns
        })
    }
};

export const tasksAPI = {
    updateTaskName(taskname, projectid, taskid) {
        return instance.put(`/projects/${projectid}/tasks/${taskid}`, {
            taskname
        })
    },
    getParticipantOnTask(projectid, taskid) {
        return instance.get(`/task/user/${projectid}/${taskid}`)
    },

    updateTasksPosAndColumnId(tasksArr, projectId) {
        return instance.put(`/projects/${projectId}/tasks/position`, {
            tasksArr
        })
    },

    updateTaskDescription(description, projectId, taskId) {
        return instance.put(`/projects/${projectId}/tasks/${taskId}`, {
            description
        })
    },

    getTasksUsers(projectId, userId) {
        return instance.get(`/projects/${projectId}/tasks/users/${userId}`)
    },

    getAllTasks(projectId) {
        return instance.get(`tasks/` + projectId);
    },

    addNewTask(taskName, columnId, projectId, position) {
        return instance.post(`projects/${projectId}/tasks`, {
            taskName, columnId, position
        });
    },

    addNewParticipant(taskId, userId, projectId) {
        console.log("userId, taskId", userId, taskId);
        return instance.post(`/projects/${projectId}/task/user/${taskId}/${userId}`)
    },

    removeParticipant(taskId, userId, projectId) {
        console.log("userId, projectId, taskId", userId, taskId);
        return instance.delete(`/projects/${projectId}/task/user/${taskId}/${userId}`)
    },

    addNewMarker(markers, projectId, taskId) {
        return instance.put(`/projects/${projectId}/tasks/${taskId}`, {
            markers
        })
    },

    removeTask(taskId, projectId) {
        return instance.delete(`/projects/${projectId}/tasks/${taskId}`)
    }
}

export const authAPI = {
    login(password, userName) {
        return axios.post(`${baseUrl}login`, {
            password,
            userName
        })
    },

    register(password, userName) {
        console.log(password, userName)
        return axios.post(`${baseUrl}users`, {
            password,
            userName
        })
    },
};