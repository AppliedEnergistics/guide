// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class ExpAnimatedTexturePartFrame {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):ExpAnimatedTexturePartFrame {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

index():number {
  return this.bb!.readUint16(this.bb_pos);
}

time():number {
  return this.bb!.readUint16(this.bb_pos + 2);
}

static sizeOf():number {
  return 4;
}

static createExpAnimatedTexturePartFrame(builder:flatbuffers.Builder, index: number, time: number):flatbuffers.Offset {
  builder.prep(2, 4);
  builder.writeInt16(time);
  builder.writeInt16(index);
  return builder.offset();
}

}
