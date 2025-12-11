'use client'

// React Imports
import { useContext, useEffect, useState } from 'react'

// Third-party Imports
import { ContentState, EditorState, convertToRaw, convertFromRaw } from 'draft-js'

// Styled Component Import
import AppReactDraftWysiwyg from './AppReactDraftWysiwyg'
import { ItemsContext } from './MainSupport'

const EditorControlled = () => {
  const { select = {}, setSelect } = useContext(ItemsContext)

  // Provide a default value for select.detail
  const detail = select.detail || ''

  // Determine the initial state of the editor
  let initialEditorState: EditorState

  if (!detail) {
    initialEditorState = EditorState.createEmpty()
  } else if (typeof detail === 'string') {
    const contentState = ContentState.createFromText(detail)

    initialEditorState = EditorState.createWithContent(contentState)
  } else {
    const contentState = convertFromRaw(detail)

    initialEditorState = EditorState.createWithContent(contentState)
  }

  const [value, setValue] = useState<EditorState>(initialEditorState)

  // Effect to update select state when editor state changes
  useEffect(() => {
    const rawContent = convertToRaw(value.getCurrentContent())

    setSelect((prevSelect: any) => ({
      ...prevSelect,
      detail: rawContent
    }))
  }, [value, setSelect])

  const handleEditorChange = (editorState: EditorState) => {
    setValue(editorState)
  }

  return (
    <AppReactDraftWysiwyg
      editorState={value}
      onEditorStateChange={handleEditorChange}
    />
  )
}

export default EditorControlled
