use wasm_bindgen::prelude::*;
use serde::Serialize;

#[derive(Serialize)]
pub struct MemoryRow {
    offset: String,
    hex: Vec<String>,
    ascii: Vec<String>,
}

#[wasm_bindgen]
pub fn parse_bytes(bytes: &[u8]) -> JsValue {
    let mut rows = Vec::new();

    for (i, chunk) in bytes.chunks(16).enumerate() {
        let offset = format!("0x{:04X}", i * 16);

        let hex: Vec<String> = chunk.iter()
            .map(|b| format!("{:02X}", b))
            .collect();

        let ascii: Vec<String> = chunk.iter()
            .map(|b| {
                if b.is_ascii_graphic() || b.is_ascii_whitespace() {
                    *b as char
                } else {
                    '.'
                }
            })
            .map(|c| c.to_string())
            .collect();

        rows.push(MemoryRow { offset, hex, ascii });
    }

    JsValue::from_serde(&rows).unwrap()
}
