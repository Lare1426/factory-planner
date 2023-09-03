import styles from "./Plan.module.scss";
import { Button, Input } from "@/components";

export default function Plan() {
  return (
    <main className={styles.plan}>
      <div className={styles.sidePanel}>
        <Input size="large" type="text" placeholder="Plan name" />
        <div>
          <label>Description</label>
          <textarea rows="5" cols="27"></textarea>
        </div>
        <div>
          <label>Product</label>
          <Input size="large" type="text" />
        </div>
        <div>
          <label>Production amount</label>
          <Input
            size="small"
            type="number"
            placeholder="0"
            min={0}
            max={20000}
          />
        </div>
        <div className={styles.buttons}>
          <Button size="small" color="primary">
            Export
          </Button>
          <Button size="small" color="primary">
            Save
          </Button>
          <Button size="small" color="primary">
            Favourite
          </Button>
          <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="red">
            Delete
          </Button>
        </div>
      </div>
    </main>
  );
}
