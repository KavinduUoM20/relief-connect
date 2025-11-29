import { IItem } from "../../../interfaces/IItem";
import { RationItemType } from "../../../enums/ration-item.enum";

/**
 * DTO for item response
 */
export class ItemResponseDto implements IItem {
  id: number;
  code: RationItemType;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(item: IItem) {
    this.id = item.id!;
    this.code = item.code;
    this.name = item.name;
    this.description = item.description;
    this.createdAt = item.createdAt;
    this.updatedAt = item.updatedAt;
  }
}

