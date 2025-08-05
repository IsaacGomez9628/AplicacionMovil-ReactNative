import { api } from "./api"

class CourseService {
  async getCourses() {
    const response = await api.get("/courses/")
    return response.data
  }

  async getCourse(courseId) {
    const response = await api.get(`/courses/${courseId}`)
    return response.data
  }

  async createCourse(courseData) {
    const response = await api.post("/courses/", courseData)
    return response.data
  }

  async updateCourse(courseId, courseData) {
    const response = await api.put(`/courses/${courseId}`, courseData)
    return response.data
  }

  async deleteCourse(courseId) {
    const response = await api.delete(`/courses/${courseId}`)
    return response.data
  }

  async getCourseModules(courseId) {
    const response = await api.get(`/courses/${courseId}/modules`)
    return response.data
  }
}

export const courseService = new CourseService()
