import { CreateProjectDto } from './create-project.dto';
import { ProjectStatus } from '../../domain/project-status.enum';
declare const UpdateProjectDto_base: import("@nestjs/common").Type<Partial<CreateProjectDto>>;
export declare class UpdateProjectDto extends UpdateProjectDto_base {
    status?: ProjectStatus;
}
export {};
