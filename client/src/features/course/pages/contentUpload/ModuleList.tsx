import React from "react";

import type {ModuleType} from '../../types/IModule'
import ModuleItem from "./ModuleItem";

interface Props {
  courseId:string
  modules: ModuleType[];
  setModules: React.Dispatch<React.SetStateAction<ModuleType[]>>;
}

export default function ModuleList({courseId, modules, setModules }: Props) {
  
  return (
    <div className="space-y-6 border border-gray-300 mt-20 dark:border-gray-700 rounded-lg">
      {modules.map((module,index) => (
        <ModuleItem
          key={module.moduleId}
          courseId={courseId}
          module={module}
          order ={index+1}
          moduleLength={modules.length}
          setModules={setModules}
        />
      ))}
    </div>
  );
}
