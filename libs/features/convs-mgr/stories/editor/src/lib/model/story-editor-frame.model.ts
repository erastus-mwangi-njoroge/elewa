import { ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';

import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';

import { Story } from '@app/model/convs-mgr/stories/main';
import { StoryBlock, StoryBlockConnection, StoryBlockTypes, VariablesConfig, HttpMethodTypes } from '@app/model/convs-mgr/stories/blocks/main';

import { StoryEditorState } from '@app/state/convs-mgr/story-editor';

import { BlockInjectorService } from '@app/features/convs-mgr/stories/blocks/library/main';
import { _JsPlumbComponentDecorator } from '@app/features/convs-mgr/stories/blocks/library/block-options';

import { AnchorBlockComponent } from '@app/features/convs-mgr/stories/blocks/library/anchor-block';
import { EndAnchorComponent } from '@app/features/convs-mgr/stories/blocks/library/anchor-block';


/**
 * Model which holds the state of a story-editor.
 * 
 * For each JsPlumb frame, an instance of this class is created which 1-on-1 manages the frame state.
 * Responsible for keeping track of editor data and for re-loading past saved states.
 */
export class StoryEditorFrame {
  private _cnt = 1;
  loaded = false;

  private _state: StoryEditorState;
  private _story: Story;
  private _blocks: StoryBlock[] = [];
  private _connections: StoryBlockConnection[];
  private _variables: VariablesConfig[]

  blocksArray: FormArray;
  variablesArray: FormArray;

  constructor(private _fb: FormBuilder,
              private _jsPlumb: BrowserJsPlumbInstance,
              private _blocksInjector: BlockInjectorService,
              private _viewport: ViewContainerRef) 
  {
      this.loaded = true;
  }

  /**
   * Function which produces the initial state of the story editor frame.
   *  It draws the previously saved blocks on the screen.
   * 
   * @param story   - Story visualised by the editor
   * @param blocks  - Blocks to render on the story
   */
  async init(state: StoryEditorState) {
    this._state = state;
    this._story = state.story;
    this._blocks = state.blocks;
    this._connections = state.connections;
    // this._variables = state.variables;

    this.blocksArray = this._fb.array([]);
    this.variablesArray = this._fb.array([]);

    // Clear any previously drawn items.
    this._viewport.clear();
    this._jsPlumb.reset();

    //create the anchor block when state is initialized
    this.createStartAnchor();

    //create the end anchor block when state is initialized
    this.createEndAnchor();

    this.drawBlocks();

    await new Promise((resolve) => setTimeout(() => resolve(true), 1000)); // gives some time for drawing to end

    this.drawConnections();
  }

  get jsPlumbInstance(): BrowserJsPlumbInstance {
    return this._jsPlumb;
  }

  /** 
   * Snapshot of the story blocks-state as edited and loaded in the frame. 
   */
  get state(): StoryEditorState {
    return this._state;
  }

  /** 
   * Snapshot of the story blocks as edited. 
   */
  get updatedBlocks(): FormArray {
    return this.blocksArray;
  }
  get updatedVariables(): FormArray {
    return this.variablesArray;
  }

  get getJsPlumbConnections() {
    return this._jsPlumb.getConnections();
  }

  createStartAnchor() {
    let startAnchor = this._viewport.createComponent(AnchorBlockComponent);
    startAnchor.instance.jsPlumb = this._jsPlumb;
  }

  createEndAnchor() {
    let endAnchor = this._viewport.createComponent(EndAnchorComponent);
    endAnchor.instance.jsPlumb = this._jsPlumb;
    endAnchor.location.nativeElement.style = `position: absolute; left: 50px; top: 150px;`;
    this._viewport.insert(endAnchor.hostView);
    this._jsPlumb.manage(endAnchor.location.nativeElement, 'story-end-anchor');
  }

  /**
  * Function which draw the blocks.
  * 
  */
  drawBlocks() {
    this._jsPlumb.setSuspendDrawing(true);   // Start loading drawing

    // Init frame
    const activeBlocks = this._blocks.filter((block) => !block.deleted);
    
    for (const block of activeBlocks) {
      this._injectBlockToFrame(block);
      this._cnt++;
    }

    this._jsPlumb.setSuspendDrawing(false, true);   // All drawing data loaded. Now draw
  }

  /**
  * Function which draw connections.
  * It draws the previously saved blocks on the screen.
  * Here we're perfoming a key feature of the frame which is drawing the existing
  * connections from the connections collection
  * 
  */
  drawConnections() {
    // returns a static NodeList representing a list of the document's elements 
    // that match the specified selector.
    // here we're holding the elements in an array inorder to find the source
    // and target elements for connection drawing later
    // sources are mostly inputs
    // targets (blocks) are wrapped inside a mat-card 
    let domSourceInputs = Array.from(document.querySelectorAll("input"));
    let domBlockCards = Array.from(document.querySelectorAll('mat-card'));
  

    for (const connection of this._connections) {
      // anchorBlock.id == this._story.id!;
      // fetching the source (input) that matches the connection source id
      let sourceElement = domSourceInputs.find((el) => el.id == connection.sourceId);
      // fetching the target (block) that matches the connection target id
      let targetElement = domBlockCards.find((el) => el.id == connection.targetId);
      
      // more infor on connect can be found -> https://docs.jsplumbtoolkit.com/community-2.x/current/articles/connections.html
      this._jsPlumb.connect({
        source: sourceElement as Element,
        target: targetElement as Element,
        anchors: ["Right", "Left"],
        endpoints: ["Dot", "Rectangle"],
        connector: {
          type: 'Flowchart',
          options: {
            cssClass: 'frame-connector'
          }
        }
      });
    }

  }

  /** 
   * Create a new block for the frame.
   * TODO: Move this to a factory later
   */
  newBlock(type: StoryBlockTypes) {

    // TODO - Dynamic rendering of default blocks.
    switch (type) {
      case StoryBlockTypes.TextMessage:
        break;
      case StoryBlockTypes.Image:
        break;
      case StoryBlockTypes.Name:
        break;
      case StoryBlockTypes.Email:
        break
      case StoryBlockTypes.PhoneNumber:
        break;
      case StoryBlockTypes.QuestionBlock:
        break;
      case StoryBlockTypes.Location:
        break;
     case StoryBlockTypes.Audio:
          break;
      case StoryBlockTypes.Video:
        break
      case StoryBlockTypes.Sticker:
        break
      case StoryBlockTypes.List:
        break;
      case StoryBlockTypes.Document:
        break
      case StoryBlockTypes.Reply:
        break;
      case StoryBlockTypes.MultipleInput:
        break
      case StoryBlockTypes.Webhook:
        break
      default:
        break
    }

    const block = {
                    id: `${this._cnt}`,
                    type: type,
                    message: '',
                    // TODO: Positioning in the middle + offset based on _cnt
                    position: { x: 200, y: 50 }
                  } as StoryBlock;

    this._cnt++;

    this._blocks.push(block);
    return this._injectBlockToFrame(block);
  }
  

  /** 
   * Private method which draws the block on the frame.
   * @see {BlockInjectorService} - package @app/features/convs-mgr/stories/blocks/library
   */
  private _injectBlockToFrame(block: StoryBlock) {
    return this._blocksInjector.newBlock(block, this._jsPlumb, this._viewport, this.blocksArray);
  }
}
