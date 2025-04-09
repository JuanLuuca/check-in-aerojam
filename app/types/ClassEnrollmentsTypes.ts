export interface ClassData {
  _id: string;
  name: string;
  time: string;
  image: {
    type: string;
    data: number[];
  };
}

export interface Enrollment {
  _id: string;
  userId: string;
  classId: string;
}

export interface ClassData {
    _id: string;
    name: string;
    time: string;
    image: {
        type: string;
        data: number[];
    };
}
  
export interface EnrollmentAddClass {
    userId: {
        _id: number
    };
    classId: string;
    userName: string;
    enrollmentDate: string;
}

export interface IFormInput {
    name: string;
    time: string;
    image: FileList;
    nameModal?: string;
    timeModal?: string;
    imageModal?: FileList;
}

export interface IFormInputLogin {
    username: string;
    password: string;
}