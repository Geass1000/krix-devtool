import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import * as Interfaces from '../../interfaces';

@Component({
  selector: 'krix-object-render',
  templateUrl: './object-render.html',
})
export class ObjectRenderComponent {
  public objectValueDescriptors: Interfaces.ObjectValueDescriptor[] = [];

  /**
   * Object which will be rendered.
   */
  private object: object = {};
  @Input('object')
  set inObject (value: object) {
    this.object = value;
    this.updateNodeDescriptorsFromNode();
    this.changeDetection.detectChanges();
  }

  /**
   * Enables an immutable check.
   * Immutable check - logic will copy `object` values only if they are changed.
   */
  private immutableCheck: boolean = false;
  @Input('immutableCheck')
  set inImmutableCheck (value: boolean) {
    this.immutableCheck = value;
    this.updateNodeDescriptorsFromNode();
    this.changeDetection.detectChanges();
  }

  /**
   * ICONs
   */
  public faMinus = faMinus;
  public faPlus = faPlus;

  constructor (
    private changeDetection: ChangeDetectorRef,
  ) {
    this.changeDetection.detach();
  }

  /**
   * Handles `Click` events for the `UL` tag. Switchs a `Node Is Opened` flag to the
   * opposite value.
   *
   * @param stateNode
   */
  onClickToggleShowUl (
    clickedObjectValueDescriptor: Interfaces.ObjectValueDescriptor,
  ): void {
    this.objectValueDescriptors = _.map(this.objectValueDescriptors, (objectValueDescriptor) => {
      if (clickedObjectValueDescriptor.key !== objectValueDescriptor.key) {
        return objectValueDescriptor;
      }

      return _.assign({}, objectValueDescriptor, {
        valueIsOpened: !clickedObjectValueDescriptor.valueIsOpened,
      });
    });

    this.changeDetection.detectChanges();
  }

  /**
   * Iterates the component store and creates from it `State Node` entities.
   *
   * @param  {any} store
   * @return {void}
   */
  updateNodeDescriptorsFromNode (
  ): void {
    if (!_.isObject(this.object)) {
      return;
    }

    const objectValueDescriptors: Interfaces.ObjectValueDescriptor[] = [];

    for (const nodePropertyName in this.object) {
      if (Object.prototype.hasOwnProperty.call(this.object, nodePropertyName) === false) {
        continue;
      }

      const oldNodeValueDescriptor = _.find(this.objectValueDescriptors, [ 'key', nodePropertyName ]);

      // Calculate `Value Can Be Opened` flag and copy node value
      let valueCanBeOpened: boolean;
      let objectValue: any;
      if (_.isObject(this.object[nodePropertyName]) || _.isArray(this.object[nodePropertyName])) {
        valueCanBeOpened = true;
        // FYI: This logic allows to skip excess preview renders.
        // It does't clone the value if the base value isn't changed.
        objectValue = this.immutableCheck === true
          && oldNodeValueDescriptor?.baseValue === this.object[nodePropertyName]
          ? oldNodeValueDescriptor?.value
          : _.clone(this.object[nodePropertyName]);
      } else {
        valueCanBeOpened = false;
        objectValue = this.object[nodePropertyName];
      }

      // If there is no old object value desciptor
      if (_.isNil(oldNodeValueDescriptor) === true) {
        // Create a new object value desciptor
        const newNodeForState: Interfaces.ObjectValueDescriptor = {
          key: nodePropertyName,
          baseValue: this.object[nodePropertyName],
          value: objectValue,
          valueCanBeOpened: valueCanBeOpened,
          valueIsOpened: false,
        };

        // Add the new object value desciptor to the list of object value descriptors
        objectValueDescriptors.push(newNodeForState);
        continue;
      }

      // Recalculate `Node Is Opened` flag
      const valueIsOpened = valueCanBeOpened === true
        ? oldNodeValueDescriptor.valueIsOpened : false;

      const updatedNodeForState = oldNodeValueDescriptor.value === objectValue
        // If value isn't updated - create copy of node
        ? oldNodeValueDescriptor
        // Otherwise create new node with updated value and flags
        : _.assign({}, oldNodeValueDescriptor, {
          baseValue: this.object[nodePropertyName],
          value: objectValue,
          valueCanBeOpened: valueCanBeOpened,
          valueIsOpened: valueIsOpened,
        });

      objectValueDescriptors.push(updatedNodeForState);
    }

    this.objectValueDescriptors = objectValueDescriptors;
  }

  /**
   * Returns an uniq key for item from args.
   *
   * @param  {number} index
   * @param  {Interfaces.ObjectValueDescriptor} item
   * @return {string}
   */
  trackByFn (
    index: number,
    item: Interfaces.ObjectValueDescriptor,
  ): string {
    return `${item.key}`;
  }
}
