import React from 'react';
import { ItemResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/item/response/item_response_dto';
import styles from '../styles/ItemList.module.css';

interface ItemListProps {
  items: ItemResponseDto[];
}

export default function ItemList({ items }: ItemListProps) {
  if (!items || items.length === 0) {
    return <p className={styles.empty}>No items yet. Add one above!</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <h4>{item.name}</h4>
          {item.description && <p>{item.description}</p>}
        </li>
      ))}
    </ul>
  );
}
