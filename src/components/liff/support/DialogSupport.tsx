import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import type { DialogProps } from '@mui/material/Dialog';

// Define types for the block and entity
type Block = {
  key: string;
  text: string;
  type: string;
  depth: number;
  inlineStyleRanges: Array<any>;
  entityRanges: Array<{ offset: number; length: number; key: number }>;
  data: Record<string, any>;
};

type Entity = {
  type: string;
  mutability: string;
  data: {
    src: string;
    height: string;
    width: string;
    alignment?: string;
  };
};

type Detail = {
  blocks: Block[];
  entityMap: { [key: number]: Entity };
};

type Data = {
  title: string;
  detail: Detail;
};

interface DialogSupportProps {
  data: Data;
}

// Function to render content based on block type
const renderBlockContent = (block: Block, entityMap: { [key: number]: Entity }) => {
  switch (block.type) {
    case 'unstyled':
      return <p key={block.key}>{block.text}</p>;
    case 'atomic':
      if (block.entityRanges.length > 0) {
        const entityKey = block.entityRanges[0].key;
        const entity = entityMap[entityKey];

        if (entity.type === 'IMAGE') {
          return (
            <Image
              key={block.key}
              src={entity.data.src}
              alt='image'
              width={100}
              height={100}
              layout="responsive"
              style={{ display: 'block', margin: '10px 0' }}
            />
          );
        } else if (entity.type === 'EMBEDDED_LINK') {
          return (
            <div key={block.key} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%', background: '#000' }}>
              <iframe
                src={entity.data.src}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                frameBorder='0'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                title='Embedded Link'
              />
            </div>
          );
        }
      }


      return null;
    default:
      return null;
  }
};

const DialogSupport: React.FC<DialogSupportProps> = ({ data }) => {
  // States
  const [open, setOpen] = useState<boolean>(false);
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper');
  const descriptionElementRef = useRef<HTMLDivElement>(null);

  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;

      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <>
      <Button
        onClick={handleClickOpen('paper')}
        variant='contained'
        className='flex whitespace-nowrap p-1 mt-1'
        color='primary'
        size='small'
      >
        อ่านต่อ
      </Button>

      <Dialog open={open} onClose={handleClose} scroll={scroll} aria-labelledby='form-dialog-title' fullWidth>
        <DialogTitle id='form-dialog-title' className='p-4 border-none text-lg font-bold'>
          {data.title}
        </DialogTitle>
        <DialogContent dividers={scroll === 'paper'} className='px-4 py-0'>
          <div className='grid gap-4' ref={descriptionElementRef} tabIndex={-1}>
            {data.detail.blocks.map(block => renderBlockContent(block, data.detail.entityMap))}
          </div>
        </DialogContent>
        <DialogActions className='dialog-actions-dense p-4'>
          <Button color='primary' onClick={handleClose}>
            ปิดหน้าจอ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogSupport;
